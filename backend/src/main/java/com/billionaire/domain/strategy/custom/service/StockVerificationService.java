package com.billionaire.domain.strategy.custom.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.billionaire.domain.strategy.custom.dto.response.VerifiedDataRes;
import com.billionaire.domain.strategy.custom.dto.response.VerifiedDetailedData2Res;
import com.billionaire.global.constants.TradingConstants;
import com.billionaire.global.util.ApiUtils;
import com.billionaire.global.util.TokenUtils;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RequiredArgsConstructor
@Service
public class StockVerificationService {
	private final ApiUtils apiUtils;
	private final TokenUtils tokenUtils;
	private static final String URL = "https://openapi.koreainvestment.com:9443/uapi/overseas-price/v1/quotations/inquire-search";

	public VerifiedDataRes verifyData(Long minMarketCap, Long maxMarketCap) {
		Map<String, String> params = Map.of(
			"AUTH", "",
			"EXCD", "NAS",
			"CO_YN_VALX", "1",
			"CO_ST_VALX", String.valueOf(minMarketCap),
			"CO_EN_VALX", String.valueOf(maxMarketCap)
		);

		ResponseEntity<VerifiedDataRes> response = apiUtils.getRequest(
			tokenUtils.createAuthorizationHeaders("HHDFS76410000"),
			URL,
			params,
			VerifiedDataRes.class
		);

		log.info("최상위 시가총액 기준 90% 이상 주식 조회 결과: {}", response.getBody());

		return response.getBody();
	}

	public List<VerifiedDetailedData2Res> filterStocksByMarketCap(List<VerifiedDetailedData2Res> verifiedDetailedData2ResList) {
		// 시총 내림차순 정렬
		verifiedDetailedData2ResList.sort((s1, s2) -> Long.compare(Long.parseLong(s2.valx()), Long.parseLong(s1.valx())));

		List<VerifiedDetailedData2Res> filteredData = new ArrayList<>();
		long largestMarketCap = Long.parseLong(verifiedDetailedData2ResList.get(0).valx());

		for (VerifiedDetailedData2Res data : verifiedDetailedData2ResList) {
			long marketCap = Long.parseLong(data.valx());
			if (marketCap >= (long)(largestMarketCap * TradingConstants.Rebalancing.MARKET_CAP_THRESHOLD)) {
				filteredData.add(data);
			} else {
				break;
			}
		}
		return filteredData;
	}
}
