package com.billionaire.domain.strategy.custom.service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RequiredArgsConstructor
@Service
public class MarketCapScraperService {
	private static final String URL = "https://kr.tradingview.com/markets/stocks-usa/market-movers-large-cap/";
	public Long getLargestMarketCap() throws IOException {
		// 데이터를 담을 리스트를 초기화
		List<Map<String, Object>> marketCaps = new ArrayList<>();

		// 테이블의 모든 행을 찾음
		Elements rows = Jsoup.connect(URL).get().select("table tbody tr");

		for (Element row : rows) {
			// 회사명 추출
			Element companyNameElement = row.selectFirst("td:nth-child(1) a");
			String companyName = companyNameElement != null ? companyNameElement.text().trim() : "N/A";

			// 시가총액 추출
			Element marketCapElement = row.selectFirst("td:nth-child(2)");
			String marketCapText = marketCapElement != null ? marketCapElement.text().trim() : "N/A";
			Long marketCap = marketCapElement != null ? parseMarketCap(marketCapText) : null;

			// 데이터를 리스트에 추가
			Map<String, Object> marketCapData = Map.of(
				"회사명", companyName,
				"시가총액", Objects.requireNonNull(marketCap),
				"시가총액_텍스트", marketCapText
			);
			marketCaps.add(marketCapData);
		}
		Long result = (Long)marketCaps.get(0).get("시가총액");
		log.info("result = {}", result);

		return result;
	}

	private Long parseMarketCap(String marketCapText) {
		// 시가총액 문자열을 숫자로 변환하는 로직
		Map<String, Long> multiplier = Map.of(
			"B", 1_000_000L,
			"T", 1_000_000_000L,
			"M", 1_000L,
			"K", 1L
		);

		// 불필요한 문자와 좁은 공백 제거
		String cleanText = marketCapText.replace("\u202F", " ").replace("USD", "").trim();

		String[] parts = cleanText.split("\\s");
		if (parts.length < 2)
			return null;

		try {
			// 첫 번째 부분은 숫자, 두 번째 부분은 단위(B, T, M, K)
			double number = Double.parseDouble(parts[0].replace(",", ""));
			String unit = parts[1].substring(0, 1); // T, B, M, K 중 하나

			// 해당 단위에 맞는 값을 곱해서 반환
			return (long)(number * multiplier.getOrDefault(unit, 1L));
		} catch (NumberFormatException e) {
			return null;
		}
	}
}
