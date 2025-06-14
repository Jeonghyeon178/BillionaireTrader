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

import com.billionaire.global.dto.MarketPriceDetailedInfoRes;
import com.billionaire.global.dto.MarketPriceRes;
import com.billionaire.domain.index.entity.Index;
import com.billionaire.domain.index.repository.IndexRepository;
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
public class IndexService {
	private static final String URL = "https://openapi.koreainvestment.com:9443/uapi/overseas-price/v1/quotations/inquire-daily-chartprice";

	private final IndexRepository indexRepository;
	private final ApiUtils apiUtils;
	private final TokenUtils tokenUtils;

	public List<Index> getIndexData(String ticker, String code) {
		String startingDate = getLatestStoredDate(ticker);
		List<Index> allIndexListInAPI = fetchAllIndexDataUntilToday(ticker, code, startingDate);

		saveIfNotExists(ticker, allIndexListInAPI);

		List<Index> indexListInDB = indexRepository.findAllByTicker(ticker);
		List<Index> todayList = allIndexListInAPI.stream()
			.filter(index -> index.getDate().isEqual(LocalDate.now()))
			.toList();

		return Stream.concat(indexListInDB.stream(), todayList.stream())
			.distinct()
			.toList();
	}

	private List<Index> fetchAllIndexDataUntilToday(String ticker, String code, String fromDate) {
		List<Index> accumulated = new ArrayList<>();
		boolean hasTodayData = false;
		String currentFromDate = fromDate;
		Double previousPrice = null;

		while (!hasTodayData) {
			MarketPriceRes indexData = fetchIndexDataFromAPI(ticker, code, currentFromDate);

			List<MarketPriceDetailedInfoRes> sorted = indexData.output2().stream()
				.filter(d -> d.stckBsopDate() != null && !d.stckBsopDate().isBlank())
				.sorted(Comparator.comparing(d -> DateUtils.parse(d.stckBsopDate())))
				.toList();

			if (sorted.isEmpty()) break;

			List<Index> indexes = new ArrayList<>();
			for (MarketPriceDetailedInfoRes data : sorted) {
				LocalDate date = DateUtils.parse(data.stckBsopDate());
				Double price = Double.valueOf(data.ovrsNmixPrpr());
				Double rate = (previousPrice == null) ? 0.0 : ((price - previousPrice) / previousPrice) * 100.0;

				indexes.add(Index.builder()
					.ticker(ticker)
					.date(date)
					.price(price)
					.rate(rate)
					.build());

				previousPrice = price;
			}

			accumulated.addAll(indexes);

			if (indexes.stream().anyMatch(i -> i.getDate().isEqual(LocalDate.now()))) {
				break;
			}

			LocalDate lastDate = indexes.get(indexes.size() - 1).getDate();
			currentFromDate = DateUtils.format(lastDate.plusDays(1));

			try {
				Thread.sleep(100); // 0.1초 대기
			} catch (InterruptedException e) {
				Thread.currentThread().interrupt();
				throw new RuntimeException("Thread sleep interrupted", e);
			}
		}

		return accumulated;
	}

	private String getLatestStoredDate(String ticker) {
		return indexRepository.findTopByTickerOrderByDateDesc(ticker)
			.map(data -> DateUtils.format(data.getDate()))
			.orElse(DateUtils.format(LocalDate.of(2008, 1, 2)));
	}

	private MarketPriceRes fetchIndexDataFromAPI(String ticker, String code, String startingDate) {
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
		log.info(String.valueOf(response.getHeaders()));
		return response.getBody();
	}

	private void saveIfNotExists(String ticker, List<Index> indexListInAPI) {
		Set<LocalDate> existingDates = indexRepository.findAllByTicker(ticker).stream()
			.map(Index::getDate)
			.collect(Collectors.toSet());

		List<Index> filteredToSave = indexListInAPI.stream()
			.filter(index -> !index.getDate().isEqual(LocalDate.now()))
			.filter(index -> !existingDates.contains(index.getDate()))
			.toList();

		indexRepository.saveAll(filteredToSave);
	}
}