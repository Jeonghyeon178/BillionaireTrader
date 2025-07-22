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
	private static final String CURRENCY_FORMAT = "%,.0f";
	private static final String PERCENTAGE_FORMAT = "%.1f%%";
	
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
		boolean isPanic = orderTriggerService.isPanic();

		flushNonStrategyStocks(ownStocks, stockInfoDtoList);
		executeRebalancing(isPanic, ownStocks, stockInfoDtoList);
	}

	private void executeRebalancing(boolean isPanic, List<DetailedStockBalanceData1Res> ownStocks, List<StockInfoDto> stockInfoDtoList) {
		rebalanceForSelling(isPanic, ownStocks, stockInfoDtoList);

		if (waitUntilSellOrdersFilled()) {
			rebalanceForBuying(isPanic, ownStocks, stockInfoDtoList);
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

	private void rebalanceForSelling(boolean isPanic, List<DetailedStockBalanceData1Res> ownStocks, List<StockInfoDto> stockInfoDtoList) {
		stockInfoDtoList.forEach(stockInfo -> {
			ProcessingData data = createProcessingData(stockInfo, ownStocks);
			processSellingStrategy(data, isPanic);
		});
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

	private void rebalanceForBuying(boolean isPanic, List<DetailedStockBalanceData1Res> ownStocks, List<StockInfoDto> stockInfoDtoList) {
		stockInfoDtoList.forEach(stockInfo -> {
			ProcessingData data = createProcessingData(stockInfo, ownStocks);
			processBuyingStrategy(data, isPanic);
		});
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

	private ProcessingData createProcessingData(StockInfoDto stockInfo, List<DetailedStockBalanceData1Res> ownStocks) {
		StockAnalysis analysis = analyzeStock(stockInfo.ticker());
		DetailedStockBalanceData1Res matched = findHoldingStock(ownStocks, stockInfo.ticker());
		double ownAmount = Double.parseDouble(matched.ovrsStckEvluAmt());

		return new ProcessingData(stockInfo, matched, ownAmount, analysis);
	}

	private DetailedStockBalanceData1Res findHoldingStock(List<DetailedStockBalanceData1Res> ownStocks, String ticker) {
		return ownStocks.stream()
			.filter(stock -> stock.ovrsPdno().equals(ticker))
			.findFirst()
			.orElseThrow(() -> new HoldingStockNotFoundException(ticker));
	}

	private void processNormalSelling(ProcessingData data) {
		if (isRecoveryConditionMet(data.analysis)) {
			executeRecoveryTrade(data, OrderType.SELL);
		}

		if (isPriceDropped(data.analysis)) {
			processDropBasedSelling(data);
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
				log.info("📊 [{}] 패닉 현금화 목표액: ₩{}", data.stockInfoDto.ticker(), formatCurrency(amountToLiquidate));

				double result = -(data.ownAmount - data.stockInfoDto.amount()) + data.stockInfoDto.amount() - amountToLiquidate;
				if (result < 0) {
					logTradingAction(data.stockInfoDto.ticker(), "패닉 현금화", -result, analysis.currentPrice, OrderType.SELL);
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
	private void processDropBasedSelling(ProcessingData data) {
		StockAnalysis analysis = data.analysis;
		double totalDropPercentage = (analysis.highestPrice - analysis.currentPrice) / analysis.highestPrice;

		int dropCount = (int)(totalDropPercentage / TradingConstants.Rebalancing.DROP_UNIT_5_PERCENT);
		if (dropCount > 0) {
			double amountToPurchase = data.stockInfoDto.amount() * TradingConstants.Rebalancing.TRADE_RATIO_10_PERCENT * dropCount;
			double result = amountToPurchase - data.ownAmount;

			if (result < 0) {
				String dropPercentage = formatPercentage(totalDropPercentage * 100);
				logTradingAction(data.stockInfoDto.ticker(), "하락 매도(" + dropPercentage + ")", -result, analysis.currentPrice, OrderType.SELL);
				orderService.stockOrder(new OrderDto(
					data.stockInfoDto.ticker(),
					(int)(result / analysis.currentPrice),
					analysis.currentPrice,
					OrderType.SELL)
				);
			}
		}
	}

	private void processNormalBuying(ProcessingData data) {
		if (isRecoveryConditionMet(data.analysis)) {
			executeRecoveryTrade(data, OrderType.BUY);
		}

		if (isPriceDropped(data.analysis)) {
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
				log.info("📊 [{}] 패닉 투자 목표액: ₩{}", data.stockInfoDto.ticker(), formatCurrency(amountToLiquidate));

				double result = -(data.ownAmount - data.stockInfoDto.amount()) + data.stockInfoDto.amount() - amountToLiquidate;
				if (result > 0) {
					logTradingAction(data.stockInfoDto.ticker(), "패닉 매수", result, analysis.currentPrice, OrderType.BUY);
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
				String dropPercentage = formatPercentage(totalDropPercentage * 100);
				logTradingAction(data.stockInfoDto.ticker(), "하락 매수(" + dropPercentage + ")", result, analysis.currentPrice, OrderType.BUY);
				orderService.stockOrder(new OrderDto(
					data.stockInfoDto.ticker(),
					(int)(result / analysis.currentPrice),
					analysis.currentPrice,
					OrderType.BUY)
				);
			}
		}
	}

	private void processSellingStrategy(ProcessingData data, boolean isPanic) {
		if (isPanic) {
			processPanicSelling(data);
		} else {
			processNormalSelling(data);
		}
	}

	private void processBuyingStrategy(ProcessingData data, boolean isPanic) {
		if (isPanic) {
			processPanicBuying(data);
		} else {
			processNormalBuying(data);
		}
	}

	private boolean isRecoveryConditionMet(StockAnalysis analysis) {
		return analysis.lowestPriceAfterHighestPrice * 1.1 < analysis.currentPrice;
	}

	private boolean isPriceDropped(StockAnalysis analysis) {
		return analysis.currentPrice < analysis.highestPrice;
	}

	private void executeRecoveryTrade(ProcessingData data, OrderType orderType) {
		double result = data.stockInfoDto.amount() - data.ownAmount;
		boolean shouldExecute = (orderType == OrderType.SELL && result < 0) || (orderType == OrderType.BUY && result > 0);
		
		if (shouldExecute) {
			double tradeAmount = Math.abs(result);
			String action = "회복 조건 " + (orderType == OrderType.SELL ? "매도" : "매수");
			logTradingAction(data.stockInfoDto.ticker(), action, tradeAmount, data.analysis.currentPrice, orderType);
			
			orderService.stockOrder(new OrderDto(
				data.stockInfoDto.ticker(),
				(int)(result / data.analysis.currentPrice),
				data.analysis.currentPrice,
				orderType)
			);
		}
	}

	private String formatCurrency(double amount) {
		return String.format(CURRENCY_FORMAT, amount);
	}

	private String formatPercentage(double percentage) {
		return String.format(PERCENTAGE_FORMAT, percentage);
	}

	private void logTradingAction(String ticker, String action, double amount, double price, OrderType orderType) {
		String emoji = orderType == OrderType.BUY ? "📈" : "📉";
		String formattedAmount = formatCurrency(amount);
		String formattedPrice = formatCurrency(price);
		int quantity = (int)(amount / price);
		
		log.info("{} [{}] {} | 금액: ₩{} | 가격: ₩{} | 수량: {}주", 
			emoji, ticker, action, formattedAmount, formattedPrice, quantity);
	}
}
