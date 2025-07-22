package com.billionaire.domain.index.service;

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

import com.billionaire.global.dto.internal.MarketPriceDetailedInfoRes;
import com.billionaire.global.dto.internal.MarketPriceRes;
import com.billionaire.domain.index.dto.response.IndexRes;
import com.billionaire.domain.index.entity.Index;
import com.billionaire.domain.index.exception.IndexDataFetchFailedException;
import com.billionaire.domain.index.repository.IndexRepository;
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
public class IndexService {
	private static final String URL = "https://openapi.koreainvestment.com:9443/uapi/overseas-price/v1/quotations/inquire-daily-chartprice";

	private final IndexRepository indexRepository;
	private final ApiUtils apiUtils;
	private final TokenUtils tokenUtils;

	@Transactional
	public List<IndexRes> getIndexData(String ticker, String code) {
		String startingDate = getLatestStoredDate(ticker);
		List<Index> allIndexListInAPI = fetchAllIndexDataUntilToday(ticker, code, startingDate);

		saveIfNotExists(ticker, allIndexListInAPI);

		List<Index> indexListInDB = indexRepository.getIndexData(ticker);
		List<Index> todayList = allIndexListInAPI.stream()
			.filter(index -> index.getDate().isEqual(LocalDate.now()))
			.toList();

		return Stream.concat(indexListInDB.stream(), todayList.stream())
			.distinct()
			.map(this::convertToIndexRes)
			.toList();
	}

	private List<Index> fetchAllIndexDataUntilToday(String ticker, String code, String fromDate) {
		List<Index> accumulated = new ArrayList<>();
		String currentFromDate = fromDate;
		Double previousPrice = null;

		while (!hasTodayData(accumulated)) {
			MarketPriceRes indexData = fetchIndexDataFromAPI(ticker, code, currentFromDate);
			List<MarketPriceDetailedInfoRes> sortedData = getSortedMarketData(indexData);

			if (sortedData.isEmpty()) {
				break;
			}

			List<Index> convertedIndexes = convertToIndexes(ticker, sortedData, previousPrice);
			accumulated.addAll(convertedIndexes);

			currentFromDate = getNextFetchDate(convertedIndexes);
			previousPrice = getLastPrice(convertedIndexes);
			waitForNextApiCall();
		}

		return accumulated;
	}

	private List<MarketPriceDetailedInfoRes> getSortedMarketData(MarketPriceRes indexData) {
		return indexData.output2().stream()
			.filter(d -> d.stckBsopDate() != null && !d.stckBsopDate().isBlank())
			.sorted(Comparator.comparing(d -> DateUtils.parse(d.stckBsopDate())))
			.toList();
	}

	private List<Index> convertToIndexes(String ticker, List<MarketPriceDetailedInfoRes> sortedData, Double previousPrice) {
		List<Index> indexes = new ArrayList<>();
		Double currentPreviousPrice = previousPrice;

		for (MarketPriceDetailedInfoRes data : sortedData) {
			LocalDate date = DateUtils.parse(data.stckBsopDate());
			Double price = Double.valueOf(data.ovrsNmixPrpr());
			Double rate = calculateRate(currentPreviousPrice, price);

			indexes.add(Index.builder()
				.ticker(ticker)
				.date(date)
				.price(price)
				.rate(rate)
				.build());

			currentPreviousPrice = price;
		}

		return indexes;
	}

	private Double calculateRate(Double previousPrice, Double currentPrice) {
		return (previousPrice == null) ? 0.0 : ((currentPrice - previousPrice) / previousPrice) * 100.0;
	}

	private boolean hasTodayData(List<Index> indexes) {
		return indexes.stream().anyMatch(i -> i.getDate().isEqual(LocalDate.now()));
	}

	private String getNextFetchDate(List<Index> indexes) {
		LocalDate lastDate = indexes.get(indexes.size() - 1).getDate();
		return DateUtils.format(lastDate.plusDays(1));
	}

	private Double getLastPrice(List<Index> indexes) {
		return indexes.get(indexes.size() - 1).getPrice();
	}

	private void waitForNextApiCall() {
		try {
			Thread.sleep((long)(TradingConstants.ApiCall.DEFAULT_WAIT_SECONDS * 1000));
		} catch (InterruptedException e) {
			Thread.currentThread().interrupt();
			throw new IndexDataFetchFailedException();
		}
	}

	private String getLatestStoredDate(String ticker) {
		try {
			Index latestIndex = indexRepository.getLatestIndexData(ticker);
			return DateUtils.format(latestIndex.getDate());
		} catch (Exception e) {
			log.info("저장된 인덱스 데이터가 없습니다. 기본 시작 날짜를 사용합니다: {}", ticker);
			return DateUtils.format(LocalDate.of(2008, 1, 2));
		}
	}

	private MarketPriceRes fetchIndexDataFromAPI(String ticker, String code, String startingDate) {
		try {
			LocalDate endDate = DateUtils.parse(startingDate).plusDays(100);
			Map<String, String> params = Map.of(
				"FID_COND_MRKT_DIV_CODE", code,
				"FID_INPUT_ISCD", ticker,
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
				throw new IndexDataFetchFailedException();
			}
			
			return response.getBody();
		} catch (Exception e) {
			throw new IndexDataFetchFailedException();
		}
	}

	private void saveIfNotExists(String ticker, List<Index> indexListInAPI) {
		try {
			Set<LocalDate> existingDates = indexRepository.getAllIndexDataByTicker(ticker).stream()
				.map(Index::getDate)
				.collect(Collectors.toSet());

			List<Index> filteredToSave = indexListInAPI.stream()
				.filter(index -> !index.getDate().isEqual(LocalDate.now()))
				.filter(index -> !existingDates.contains(index.getDate()))
				.toList();

			indexRepository.saveAll(filteredToSave);
		} catch (Exception e) {
			log.info("기존 데이터가 없습니다. 모든 데이터를 저장합니다: {}", ticker);
			List<Index> filteredToSave = indexListInAPI.stream()
				.filter(index -> !index.getDate().isEqual(LocalDate.now()))
				.toList();

			indexRepository.saveAll(filteredToSave);
		}
	}

	private IndexRes convertToIndexRes(Index index) {
		return IndexRes.builder()
			.ticker(index.getTicker())
			.date(index.getDate())
			.price(index.getPrice())
			.rate(index.getRate())
			.build();
	}
}