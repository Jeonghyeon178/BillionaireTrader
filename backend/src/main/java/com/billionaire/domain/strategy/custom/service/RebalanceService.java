package com.billionaire.domain.strategy.custom.service;

import java.util.Comparator;
import java.util.Iterator;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.billionaire.domain.account.dto.response.DetailedStockBalanceData1Res;
import com.billionaire.domain.order.OrderService;
import com.billionaire.domain.order.model.Order;
import com.billionaire.domain.order.type.OrderType;
import com.billionaire.domain.pendingorder.service.PendingOrderService;
import com.billionaire.domain.stock.entity.Stock;
import com.billionaire.domain.stock.service.StockService;
import com.billionaire.domain.strategy.custom.dto.StockInfoDto;
import com.billionaire.domain.strategy.custom.type.InterestCondition;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RequiredArgsConstructor
@Service
public class RebalanceService {
	private final OrderService orderService;
	private final OrderTriggerService orderTriggerService;
	private final PendingOrderService pendingOrderService;
	private final StockService stockService;

	public void rebalance(List<DetailedStockBalanceData1Res> ownStocks, List<StockInfoDto> stockInfoDtoList) {
		// TODO 금리 체크. 추후에 매도, 매수 전략에 반영할 수 있도록..
		InterestCondition interestCondition = InterestCondition.NORMAL;

		// 지수 트리거 설정.
		boolean trigger = orderTriggerService.isPanic();

		// 매도
		flushNonStrategyStocks(ownStocks, stockInfoDtoList);

		// 기존 보유 주식 수 조정 (매도)
		rebalanceForSelling(trigger, ownStocks, stockInfoDtoList);

		// pendingOrder() ..
		boolean sellOrdersDone = waitUntilSellOrdersFilled();

		// 매수 대상 주식 매수
		if (sellOrdersDone) {
			rebalanceForBuying(trigger,ownStocks, stockInfoDtoList);
		}

	}

	// 매수 대상 정보와 기존 보유 중인 정보를 비교해서 매수 대상에 들어있지 않은 보유 종목 판매.
	private void flushNonStrategyStocks(List<DetailedStockBalanceData1Res> stocks, List<StockInfoDto> targetStocks) {
		Iterator<DetailedStockBalanceData1Res> iterator = stocks.iterator();
		while (iterator.hasNext()) {
			DetailedStockBalanceData1Res holdingStock = iterator.next();
			// 현재 보유 종목이 전략 대상이 아닌 경우 전량 매도
			boolean isTarget = targetStocks.stream()
				.anyMatch(stockInfo -> stockInfo.ticker().equals(holdingStock.ovrsPdno()));

			if (!isTarget && !holdingStock.ovrsPdno().isBlank()) {
				orderService.stockOrder(Order.builder()
					.ticker(holdingStock.ovrsPdno())
					.quantity(Integer.parseInt(holdingStock.ordPsblQty()))
					.price(Double.parseDouble(holdingStock.nowPric2()))
					.orderType(OrderType.SELL)
					.build());

				log.info("{} 전량매도", holdingStock.ovrsItemName());
				iterator.remove();
			}
		}
	}

	private void rebalanceForSelling(boolean trigger, List<DetailedStockBalanceData1Res> ownStocks, List<StockInfoDto> stockInfoDtoList) {
		for (StockInfoDto stockInfoDto : stockInfoDtoList) {
			List<Stock> data = stockService.getStockData(stockInfoDto.ticker());
			// 전고점
			Stock highest = data.stream()
				.max(Comparator.comparing(Stock::getPrice))
				.orElseThrow(() -> new IllegalStateException("전고점 데이터가 없습니다"));

			// 전고점 이후 전저점
			Stock lowestAfterHigh = data.stream()
				.filter(s -> s.getDate().isAfter(highest.getDate()))
				.min(Comparator.comparing(Stock::getPrice))
				.orElseThrow(() -> new IllegalStateException("전고점 이후 전저점 데이터가 없습니다"));

			double highestPrice = highest.getPrice();
			double lowestPriceAfterHighestPrice = lowestAfterHigh.getPrice();
			double currentPrice = data.get(data.size() - 1).getPrice();

			// 평가금액 찾기 (보유 주식 정보에서 해당 티커 찾기)
			DetailedStockBalanceData1Res matched = ownStocks.stream()
				.filter(own -> own.ovrsPdno().equals(stockInfoDto.ticker()))
				.findFirst()
				.orElseThrow(() -> new IllegalStateException("해당 종목 보유 정보를 찾을 수 없습니다: " + stockInfoDto.ticker()));

			double ownAmount = Double.parseDouble(matched.ovrsStckEvluAmt());

			if (!trigger) {
				// 그리고 전저점 체크하고 전저점 대비 10% 상승 시 보유현금 전부 매수
				if (lowestPriceAfterHighestPrice * 1.1 < currentPrice) {
					// 보유액수 뺀 나머지 매수 (amount - ownAmount) 음수가 나오면? 그만큼 매도 진행.
					double result = stockInfoDto.amount() - ownAmount;
					if (result < 0) {
						log.info("{} 매도: {}", stockInfoDto.ticker(), result);
						// 근사치에 유사하게 매도를 진행해야 하는데..
						orderService.stockOrder(new Order(
							stockInfoDto.ticker(),
							(int)(result / currentPrice),
							currentPrice,
							OrderType.SELL)
						);
					}
				}
				if (currentPrice < highestPrice) {
					double totalDropPercentage = (highestPrice - currentPrice) / highestPrice;

					int dropCount = (int)(totalDropPercentage / 0.05);
					if (dropCount > 0) {
						double amountToPurchase = stockInfoDto.amount() * 0.1 * dropCount; // 10%

						// 현재 해당 주식의 보유량 체크
						// amountToPurchase - ownAmount (마찬가지로 음수일 경우 그만큼 매도 진행)
						double result = amountToPurchase - ownAmount;

						if (result < 0) {
							log.info("{} 매도: {}", stockInfoDto.ticker(), -result);
							orderService.stockOrder(new Order(
								stockInfoDto.ticker(),
								(int)(result / currentPrice),
								currentPrice,
								OrderType.SELL)
							);

						}
					}
				}
			} else {
				// 하락 비율 계산
				// 주식 조회 후 전고점 대비 -2.5% 떨어질 때마다 10% 현금화 진행
				if (currentPrice < highestPrice) {
					double totalDropPercentage = (highestPrice - currentPrice) / highestPrice;

					// 하락 비율이 2.5%의 배수인지 확인
					int dropCount = (int)(totalDropPercentage / 0.025);

					// 현금화 로직 실행
					if (dropCount > 0) {
						double amountToLiquidate = stockInfoDto.amount() * 0.1 * dropCount; // 10%

						// 현금화 실행
						// ownAmount - amount (양수: 매도, 음수: 매수)
						// amount - amountToLiquidate (양수: 매수, 음수: 매도)
						log.info("현금화 액수: {}", amountToLiquidate);

						double result = -(ownAmount - stockInfoDto.amount()) + stockInfoDto.amount() - amountToLiquidate;
						if (result < 0) {
							log.info("현금화 액수: {}", result);
							orderService.stockOrder(new Order(
								stockInfoDto.ticker(),
								(int)(result / currentPrice),
								currentPrice,
								OrderType.SELL
							));
						}
					}
				}
			}
		}
	}

	// TODO 추후 확인
	private boolean waitUntilSellOrdersFilled() {
		final int maxRetry = 10;       // 최대 10회 시도
		final int delayMillis = 3000;  // 3초 간격
		int retry = 0;

		while (retry < maxRetry) {
			if (pendingOrderService.verifyOrder()) {
				log.info("✅ 모든 매도 주문 체결 완료");
				return true;
			}
			log.info("⏳ 매도 주문 미체결 상태. {}초 후 재확인", delayMillis / 1000);
			try {
				Thread.sleep(delayMillis);
			} catch (InterruptedException e) {
				Thread.currentThread().interrupt();
				log.warn("❗ 매도 주문 체결 대기 중 인터럽트 발생");
				return false;
			}
			retry++;
		}

		log.warn("⚠️ 매도 주문 체결 실패 또는 타임아웃");
		return false;
	}

	private void rebalanceForBuying(boolean trigger, List<DetailedStockBalanceData1Res> ownStocks, List<StockInfoDto> stockInfoDtoList) {
		for (StockInfoDto stockInfoDto : stockInfoDtoList) {
			List<Stock> data = stockService.getStockData(stockInfoDto.ticker());

			Stock highest = data.stream()
				.max(Comparator.comparing(Stock::getPrice))
				.orElseThrow(() -> new IllegalStateException("전고점 데이터가 없습니다"));

			Stock lowestAfterHigh = data.stream()
				.filter(s -> s.getDate().isAfter(highest.getDate()))
				.min(Comparator.comparing(Stock::getPrice))
				.orElseThrow(() -> new IllegalStateException("전고점 이후 전저점 데이터가 없습니다"));

			double highestPrice = highest.getPrice();
			double lowestPriceAfterHighestPrice = lowestAfterHigh.getPrice();
			double currentPrice = data.get(data.size() - 1).getPrice();

			DetailedStockBalanceData1Res matched = ownStocks.stream()
				.filter(own -> own.ovrsPdno().equals(stockInfoDto.ticker()))
				.findFirst()
				.orElseThrow(() -> new IllegalStateException("해당 종목 보유 정보를 찾을 수 없습니다: " + stockInfoDto.ticker()));

			double ownAmount = Double.parseDouble(matched.ovrsStckEvluAmt());

			if (!trigger) {
				// 그리고 전저점 체크하고 전저점 대비 10% 상승 시 보유현금 전부 매수
				if (lowestPriceAfterHighestPrice * 1.1 < currentPrice) {
					// 보유액수 뺀 나머지 매수 (amount - ownAmount) 음수가 나오면? 그만큼 매도 진행.
					double result = stockInfoDto.amount() - ownAmount;
					if (result > 0) {
						log.info("{} 매수: {}", stockInfoDto.ticker(), stockInfoDto.amount());
						// 근사치에 유사하게 매도를 진행해야 하는데..
						orderService.stockOrder(new Order(
							stockInfoDto.ticker(),
							(int)(result / currentPrice),
							currentPrice,
							OrderType.BUY)
						);
					}
				}
				if (currentPrice < highestPrice) {
					double totalDropPercentage = (highestPrice - currentPrice) / highestPrice;

					int dropCount = (int)(totalDropPercentage / 0.05);
					if (dropCount > 0) {
						double amountToPurchase = stockInfoDto.amount() * 0.1 * dropCount; // 10%

						// 현재 해당 주식의 보유량 체크
						// amountToPurchase - ownAmount (마찬가지로 음수일 경우 그만큼 매도 진행)
						double result = amountToPurchase - ownAmount;

						if (result > 0) {
							log.info("{} 매수: {}", stockInfoDto.ticker(), result);
							orderService.stockOrder(new Order(
								stockInfoDto.ticker(),
								(int)(result / currentPrice),
								currentPrice,
								OrderType.BUY)
							);

						}
					}
				}
			} else {
				// 하락 비율 계산
				// 주식 조회 후 전고점 대비 -2.5% 떨어질 때마다 10% 현금화 진행
				if (currentPrice < highestPrice) {
					double totalDropPercentage = (highestPrice - currentPrice) / highestPrice;

					// 하락 비율이 2.5%의 배수인지 확인
					int dropCount = (int)(totalDropPercentage / 0.025);

					// 현금화 로직 실행
					if (dropCount > 0) {
						double amountToLiquidate = stockInfoDto.amount() * 0.1 * dropCount; // 10%

						// 현금화 실행
						// ownAmount - amount (양수: 매도, 음수: 매수)
						// amount - amountToLiquidate (양수: 매수, 음수: 매도)
						log.info("현금화 액수: {}", amountToLiquidate);

						double result = -(ownAmount - stockInfoDto.amount()) + stockInfoDto.amount() - amountToLiquidate;
						if (result > 0) {
							log.info("매수 액수: {}", result);
							orderService.stockOrder(new Order(
								stockInfoDto.ticker(),
								(int)(result / currentPrice),
								currentPrice,
								OrderType.BUY
							));
						}
					}
				}
			}
		}
	}
}
