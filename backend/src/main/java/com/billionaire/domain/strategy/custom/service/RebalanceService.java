package com.billionaire.domain.strategy.custom.service;

import java.util.Comparator;
import java.util.Iterator;
import java.util.List;

import org.springframework.stereotype.Service;

import com.billionaire.domain.account.dto.response.DetailedStockBalanceData1Res;
import com.billionaire.domain.order.service.OrderService;
import com.billionaire.domain.order.dto.internal.OrderDto;
import com.billionaire.domain.order.type.OrderType;
import com.billionaire.domain.order.service.PendingOrderService;
import com.billionaire.domain.stock.dto.response.StockRes;
import com.billionaire.domain.stock.service.StockService;
import com.billionaire.domain.strategy.custom.dto.internal.StockInfoDto;
import com.billionaire.domain.strategy.custom.exception.HighestPriceNotFoundException;
import com.billionaire.domain.strategy.custom.exception.HoldingStockNotFoundException;
import com.billionaire.domain.strategy.custom.exception.LowestPriceNotFoundException;

import com.billionaire.global.constants.TradingConstants;

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

	// 주식 분석 결과를 담는 내부 클래스
	private static class StockAnalysis {
		final StockRes highest;
		final StockRes lowestAfterHigh;
		final double highestPrice;
		final double lowestPriceAfterHighestPrice;
		final double currentPrice;

		StockAnalysis(StockRes highest, StockRes lowestAfterHigh, double currentPrice) {
			this.highest = highest;
			this.lowestAfterHigh = lowestAfterHigh;
			this.highestPrice = highest.price();
			this.lowestPriceAfterHighestPrice = lowestAfterHigh.price();
			this.currentPrice = currentPrice;
		}
	}

	// 처리 데이터를 담는 내부 클래스
	private static class ProcessingData {
		final StockInfoDto stockInfoDto;
		final DetailedStockBalanceData1Res matched;
		final double ownAmount;
		final StockAnalysis analysis;

		ProcessingData(StockInfoDto stockInfoDto, DetailedStockBalanceData1Res matched,
			double ownAmount, StockAnalysis analysis) {
			this.stockInfoDto = stockInfoDto;
			this.matched = matched;
			this.ownAmount = ownAmount;
			this.analysis = analysis;
		}
	}

	public void rebalance(List<DetailedStockBalanceData1Res> ownStocks, List<StockInfoDto> stockInfoDtoList) {
		boolean trigger = orderTriggerService.isPanic();

		flushNonStrategyStocks(ownStocks, stockInfoDtoList);
		rebalanceForSelling(trigger, ownStocks, stockInfoDtoList);

		boolean sellOrdersDone = waitUntilSellOrdersFilled();
		if (sellOrdersDone) {
			rebalanceForBuying(trigger, ownStocks, stockInfoDtoList);
		}

	}

	private void flushNonStrategyStocks(List<DetailedStockBalanceData1Res> stocks, List<StockInfoDto> targetStocks) {
		Iterator<DetailedStockBalanceData1Res> iterator = stocks.iterator();
		while (iterator.hasNext()) {
			DetailedStockBalanceData1Res holdingStock = iterator.next();

			boolean isTarget = targetStocks.stream()
				.anyMatch(stockInfo -> stockInfo.ticker().equals(holdingStock.ovrsPdno()));

			if (!isTarget && !holdingStock.ovrsPdno().isBlank()) {
				orderService.stockOrder(OrderDto.builder()
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
			StockAnalysis analysis = analyzeStock(stockInfoDto.ticker());
			ProcessingData data = prepareProcessingData(stockInfoDto, ownStocks, analysis);

			if (!trigger) {
				processNormalSelling(data);
			} else {
				processPanicSelling(data);
			}
		}
	}

	private boolean waitUntilSellOrdersFilled() {
		final int maxRetry = 10;
		final int delayMillis = 3000;
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
			StockAnalysis analysis = analyzeStock(stockInfoDto.ticker());
			ProcessingData data = prepareProcessingData(stockInfoDto, ownStocks, analysis);

			if (!trigger) {
				processNormalBuying(data);
			} else {
				processPanicBuying(data);
			}
		}
	}

	// 주식 분석 메서드
	private StockAnalysis analyzeStock(String ticker) {
		List<StockRes> data = stockService.getStockData(ticker);

		StockRes highest = data.stream()
			.max(Comparator.comparing(StockRes::price))
			.orElseThrow(() -> new HighestPriceNotFoundException(ticker));

		StockRes lowestAfterHigh = data.stream()
			.filter(s -> s.date().isAfter(highest.date()))
			.min(Comparator.comparing(StockRes::price))
			.orElseThrow(() -> new LowestPriceNotFoundException(ticker));

		double currentPrice = data.get(data.size() - 1).price();

		return new StockAnalysis(highest, lowestAfterHigh, currentPrice);
	}

	// 처리 데이터 준비 메서드
	private ProcessingData prepareProcessingData(StockInfoDto stockInfoDto,
		List<DetailedStockBalanceData1Res> ownStocks,
		StockAnalysis analysis) {
		DetailedStockBalanceData1Res matched = ownStocks.stream()
			.filter(own -> own.ovrsPdno().equals(stockInfoDto.ticker()))
			.findFirst()
			.orElseThrow(() -> new HoldingStockNotFoundException(stockInfoDto.ticker()));

		double ownAmount = Double.parseDouble(matched.ovrsStckEvluAmt());

		return new ProcessingData(stockInfoDto, matched, ownAmount, analysis);
	}

	// 일반 상황에서의 매도 처리
	private void processNormalSelling(ProcessingData data) {
		StockAnalysis analysis = data.analysis;

		if (analysis.lowestPriceAfterHighestPrice * 1.1 < analysis.currentPrice) {
			double result = data.stockInfoDto.amount() - data.ownAmount;
			if (result < 0) {
				log.info("{} 매도: {}", data.stockInfoDto.ticker(), result);
				orderService.stockOrder(new OrderDto(
					data.stockInfoDto.ticker(),
					(int)(result / analysis.currentPrice),
					analysis.currentPrice,
					OrderType.SELL)
				);
			}
		}

		if (analysis.currentPrice < analysis.highestPrice) {
			processDropBasedSelling(data, TradingConstants.Rebalancing.DROP_UNIT_5_PERCENT);
		}
	}

	// 패닉 상황에서의 매도 처리
	private void processPanicSelling(ProcessingData data) {
		StockAnalysis analysis = data.analysis;

		if (analysis.currentPrice < analysis.highestPrice) {
			double totalDropPercentage = (analysis.highestPrice - analysis.currentPrice) / analysis.highestPrice;
			int dropCount = (int)(totalDropPercentage / TradingConstants.Rebalancing.RISE_UNIT_2_5_PERCENT);

			if (dropCount > 0) {
				double amountToLiquidate = data.stockInfoDto.amount() * TradingConstants.Rebalancing.TRADE_RATIO_10_PERCENT * dropCount;
				log.info("현금화 액수: {}", amountToLiquidate);

				double result = -(data.ownAmount - data.stockInfoDto.amount()) + data.stockInfoDto.amount() - amountToLiquidate;
				if (result < 0) {
					log.info("현금화 액수: {}", result);
					orderService.stockOrder(new OrderDto(
						data.stockInfoDto.ticker(),
						(int)(result / analysis.currentPrice),
						analysis.currentPrice,
						OrderType.SELL
					));
				}
			}
		}
	}

	// 하락률 기반 매도 처리
	private void processDropBasedSelling(ProcessingData data, double dropUnit) {
		StockAnalysis analysis = data.analysis;
		double totalDropPercentage = (analysis.highestPrice - analysis.currentPrice) / analysis.highestPrice;

		int dropCount = (int)(totalDropPercentage / dropUnit);
		if (dropCount > 0) {
			double amountToPurchase = data.stockInfoDto.amount() * TradingConstants.Rebalancing.TRADE_RATIO_10_PERCENT * dropCount;
			double result = amountToPurchase - data.ownAmount;

			if (result < 0) {
				log.info("{} 매도: {}", data.stockInfoDto.ticker(), -result);
				orderService.stockOrder(new OrderDto(
					data.stockInfoDto.ticker(),
					(int)(result / analysis.currentPrice),
					analysis.currentPrice,
					OrderType.SELL)
				);
			}
		}
	}

	// 일반 상황에서의 매수 처리
	private void processNormalBuying(ProcessingData data) {
		StockAnalysis analysis = data.analysis;

		if (analysis.lowestPriceAfterHighestPrice * 1.1 < analysis.currentPrice) {
			double result = data.stockInfoDto.amount() - data.ownAmount;
			if (result > 0) {
				log.info("{} 매수: {}", data.stockInfoDto.ticker(), data.stockInfoDto.amount());
				orderService.stockOrder(new OrderDto(
					data.stockInfoDto.ticker(),
					(int)(result / analysis.currentPrice),
					analysis.currentPrice,
					OrderType.BUY)
				);
			}
		}

		if (analysis.currentPrice < analysis.highestPrice) {
			processDropBasedBuying(data);
		}
	}

	// 패닉 상황에서의 매수 처리
	private void processPanicBuying(ProcessingData data) {
		StockAnalysis analysis = data.analysis;

		if (analysis.currentPrice < analysis.highestPrice) {
			double totalDropPercentage = (analysis.highestPrice - analysis.currentPrice) / analysis.highestPrice;
			int dropCount = (int)(totalDropPercentage / TradingConstants.Rebalancing.RISE_UNIT_2_5_PERCENT);

			if (dropCount > 0) {
				double amountToLiquidate = data.stockInfoDto.amount() * TradingConstants.Rebalancing.TRADE_RATIO_10_PERCENT * dropCount;
				log.info("현금화 액수: {}", amountToLiquidate);

				double result = -(data.ownAmount - data.stockInfoDto.amount()) + data.stockInfoDto.amount() - amountToLiquidate;
				if (result > 0) {
					log.info("매수 액수: {}", result);
					orderService.stockOrder(new OrderDto(
						data.stockInfoDto.ticker(),
						(int)(result / analysis.currentPrice),
						analysis.currentPrice,
						OrderType.BUY
					));
				}
			}
		}
	}

	// 하락률 기반 매수 처리
	private void processDropBasedBuying(ProcessingData data) {
		StockAnalysis analysis = data.analysis;
		double totalDropPercentage = (analysis.highestPrice - analysis.currentPrice) / analysis.highestPrice;

		int dropCount = (int)(totalDropPercentage / TradingConstants.Rebalancing.DROP_UNIT_5_PERCENT);
		if (dropCount > 0) {
			double amountToPurchase = data.stockInfoDto.amount() * TradingConstants.Rebalancing.TRADE_RATIO_10_PERCENT * dropCount;
			double result = amountToPurchase - data.ownAmount;

			if (result > 0) {
				log.info("{} 매수: {}", data.stockInfoDto.ticker(), result);
				orderService.stockOrder(new OrderDto(
					data.stockInfoDto.ticker(),
					(int)(result / analysis.currentPrice),
					analysis.currentPrice,
					OrderType.BUY)
				);
			}
		}
	}
}
