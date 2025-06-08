package com.billionaire.domain.stock.service;

import java.time.LocalDate;
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
import com.billionaire.domain.stock.entity.Stock;
import com.billionaire.domain.stock.repository.StockRepository;
import com.billionaire.global.util.ApiUtils;
import com.billionaire.global.util.DateUtils;
import com.billionaire.global.util.TokenUtils;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RequiredArgsConstructor
@Service
@Transactional
public class StockService {
	private static final String URL = "https://openapi.koreainvestment.com:9443/uapi/overseas-price/v1/quotations/inquire-daily-chartprice";

	private final StockRepository stockRepository;
	private final ApiUtils apiUtils;
	private final TokenUtils tokenUtils;

	public List<Stock> getStockData(String ticker) {
		String startingDate = getLatestStoredDate(ticker);
		MarketPriceRes stockData = fetchStockDataFromAPI(ticker, startingDate);

		// 날짜 정렬 보장
		List<MarketPriceDetailedInfoRes> sorted = stockData.output2().stream()
			.filter(d -> d.stckBsopDate() != null && !d.stckBsopDate().isBlank())  // null, 빈값 방지
			.sorted(Comparator.comparing(d -> DateUtils.parse(d.stckBsopDate())))
			.toList();

		// API 데이터 → 엔티티 변환
		List<Stock> stockListInAPI = sorted.stream()
			.map(data -> Stock.builder()
				.ticker(ticker)
				.date(DateUtils.parse(data.stckBsopDate()))
				.price(Double.valueOf(data.ovrsNmixPrpr()))
				.build())
			.toList();

		// 오늘 제외하고 저장 + 중복 방지
		saveIfNotExists(ticker, stockListInAPI);

		// DB 데이터 + 오늘 데이터 결합
		List<Stock> stockListInDB = stockRepository.findAllByTicker(ticker);
		List<Stock> todayList = stockListInAPI.stream()
			.filter(stock -> stock.getDate().isEqual(LocalDate.now()))
			.toList();

		return Stream.concat(stockListInDB.stream(), todayList.stream())
			.distinct()
			.toList();
	}

	private String getLatestStoredDate(String ticker) {
		return stockRepository.findTopByTickerOrderByDateDesc(ticker)
			.map(stock -> DateUtils.format(stock.getDate()))
			.orElse(DateUtils.format(LocalDate.of(2024, 1, 2)));
	}

	private MarketPriceRes fetchStockDataFromAPI(String ticker, String startingDate) {
		Map<String, String> params = Map.of(
			"FID_COND_MRKT_DIV_CODE", "N",
			"FID_INPUT_ISCD", ticker.toUpperCase(),
			"FID_INPUT_DATE_1", startingDate,
			"FID_INPUT_DATE_2", DateUtils.nowInYYYYMMDD(),
			"FID_PERIOD_DIV_CODE", "D",
			"tr_id", ""
		);

		ResponseEntity<MarketPriceRes> response = apiUtils.getRequest(
			tokenUtils.createAuthorizationBody("FHKST03030100"),
			URL,
			params,
			MarketPriceRes.class
		);
		log.info(String.valueOf(response.getHeaders()));
		// TODO
		// if (response.getHeaders())

		return response.getBody();
	}

	private void saveIfNotExists(String ticker, List<Stock> stockListInAPI) {
		Set<LocalDate> existingDates = stockRepository.findAllByTicker(ticker).stream()
			.map(Stock::getDate)
			.collect(Collectors.toSet());

		List<Stock> filteredToSave = stockListInAPI.stream()
			.filter(stock -> !stock.getDate().isEqual(LocalDate.now()))
			.filter(stock -> !existingDates.contains(stock.getDate()))
			.toList();

		stockRepository.saveAll(filteredToSave);
	}
}