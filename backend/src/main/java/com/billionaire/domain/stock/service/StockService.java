package com.billionaire.domain.stock.service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.billionaire.global.dto.MarketPriceDetailedInfoRes;
import com.billionaire.global.dto.MarketPriceRes;
import com.billionaire.domain.stock.dto.response.StockRes;
import com.billionaire.domain.stock.entity.Stock;
import com.billionaire.domain.stock.exception.StockDataFetchFailedException;
import com.billionaire.domain.stock.repository.StockRepository;
import com.billionaire.global.constants.TradingConstants;
import com.billionaire.global.util.ApiUtils;
import com.billionaire.global.util.DateUtils;
import com.billionaire.global.util.TokenUtils;

import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RequiredArgsConstructor
@Service
public class StockService {
	private static final String URL = "https://openapi.koreainvestment.com:9443/uapi/overseas-price/v1/quotations/inquire-daily-chartprice";

	private final StockRepository stockRepository;
	private final ApiUtils apiUtils;
	private final TokenUtils tokenUtils;

	@Transactional
	public List<StockRes> getStockData(String ticker) {
		String startingDate = getLatestStoredDate(ticker);
		List<Stock> allStockListInAPI = fetchAllStockDataUntilToday(ticker, startingDate);

		saveIfNotExists(ticker, allStockListInAPI);

		List<Stock> stockListInDB = stockRepository.getStockData(ticker);
		List<Stock> todayList = allStockListInAPI.stream()
			.filter(stock -> stock.getDate().isEqual(LocalDate.now()))
			.toList();

		return Stream.concat(stockListInDB.stream(), todayList.stream())
			.distinct()
			.map(this::convertToStockRes)
			.toList();
	}

	private List<Stock> fetchAllStockDataUntilToday(String ticker, String fromDate) {
		List<Stock> accumulated = new ArrayList<>();
		String currentFromDate = fromDate;

		while (!hasTodayData(accumulated)) {
			MarketPriceRes stockData = fetchStockDataFromAPI(ticker, currentFromDate);
			List<MarketPriceDetailedInfoRes> sortedData = getSortedMarketData(stockData);

			if (sortedData.isEmpty()) {
				break;
			}

			List<Stock> convertedStocks = convertToStocks(ticker, sortedData);
			accumulated.addAll(convertedStocks);

			currentFromDate = getNextFetchDate(convertedStocks);
			waitForNextApiCall();
		}

		return accumulated;
	}

	private List<MarketPriceDetailedInfoRes> getSortedMarketData(MarketPriceRes stockData) {
		return stockData.output2().stream()
			.filter(d -> d.stckBsopDate() != null && !d.stckBsopDate().isBlank())
			.sorted(Comparator.comparing(d -> DateUtils.parse(d.stckBsopDate())))
			.toList();
	}

	private List<Stock> convertToStocks(String ticker, List<MarketPriceDetailedInfoRes> sortedData) {
		return sortedData.stream()
			.map(data -> Stock.builder()
				.ticker(ticker)
				.date(DateUtils.parse(data.stckBsopDate()))
				.price(Double.valueOf(data.ovrsNmixPrpr()))
				.build())
			.toList();
	}

	private boolean hasTodayData(List<Stock> stocks) {
		return stocks.stream().anyMatch(s -> s.getDate().isEqual(LocalDate.now()));
	}

	private String getNextFetchDate(List<Stock> stocks) {
		LocalDate lastDate = stocks.get(stocks.size() - 1).getDate();
		return DateUtils.format(lastDate.plusDays(1));
	}

	private void waitForNextApiCall() {
		try {
			Thread.sleep(TradingConstants.ApiCall.CALL_INTERVAL_MS);
		} catch (InterruptedException e) {
			Thread.currentThread().interrupt();
			throw new StockDataFetchFailedException();
		}
	}

	private String getLatestStoredDate(String ticker) {
		try {
			Stock latestStock = stockRepository.getLatestStockData(ticker);
			return DateUtils.format(latestStock.getDate());
		} catch (Exception e) {
			log.info("저장된 주식 데이터가 없습니다. 기본 시작 날짜를 사용합니다: {}", ticker);
			return DateUtils.format(LocalDate.of(2008, 1, 2));
		}
	}

	private MarketPriceRes fetchStockDataFromAPI(String ticker, String startingDate) {
		try {
			LocalDate endDate = DateUtils.parse(startingDate).plusDays(100);
			Map<String, String> params = Map.of(
				"FID_COND_MRKT_DIV_CODE", "N",
				"FID_INPUT_ISCD", ticker.toUpperCase(),
				"FID_INPUT_DATE_1", startingDate,
				"FID_INPUT_DATE_2", DateUtils.format(endDate),
				"FID_PERIOD_DIV_CODE", "D"
			);
			ResponseEntity<MarketPriceRes> response = apiUtils.getRequest(
				tokenUtils.createAuthorizationHeaders("FHKST03030100"),
				URL,
				params,
				MarketPriceRes.class
			);

			
			if (response.getBody() == null) {
				throw new StockDataFetchFailedException();
			}
			
			return response.getBody();
		} catch (Exception e) {
			throw new StockDataFetchFailedException();
		}
	}

	private void saveIfNotExists(String ticker, List<Stock> stockListInAPI) {
		try {
			Set<LocalDate> existingDates = stockRepository.getStockData(ticker).stream()
				.map(Stock::getDate)
				.collect(Collectors.toSet());

			List<Stock> filteredToSave = stockListInAPI.stream()
				.filter(stock -> !stock.getDate().isEqual(LocalDate.now()))
				.filter(stock -> !existingDates.contains(stock.getDate()))
				.toList();

			stockRepository.saveAll(filteredToSave);
		} catch (Exception e) {
			log.info("기존 데이터가 없습니다. 모든 데이터를 저장합니다: {}", ticker);
			List<Stock> filteredToSave = stockListInAPI.stream()
				.filter(stock -> !stock.getDate().isEqual(LocalDate.now()))
				.toList();

			stockRepository.saveAll(filteredToSave);
		}
	}

	private StockRes convertToStockRes(Stock stock) {
		return StockRes.builder()
			.ticker(stock.getTicker())
			.date(stock.getDate())
			.price(stock.getPrice())
			.build();
	}
}