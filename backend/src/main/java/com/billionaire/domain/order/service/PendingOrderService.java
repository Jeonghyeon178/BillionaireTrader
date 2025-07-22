package com.billionaire.domain.order.service;

import java.util.Map;
import java.util.Objects;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.billionaire.domain.order.dto.response.InquireNccsRes;
import com.billionaire.global.util.ApiUtils;
import com.billionaire.global.util.TokenUtils;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RequiredArgsConstructor
@Service
public class PendingOrderService {
	private static final String URL = "https://openapi.koreainvestment.com:9443/uapi/overseas-stock/v1/trading/inquire-nccs";
	@Value("${ks.account-number}")
	private String accountNumber;
	@Value("${ks.account-product-code}")
	private String accountProductCode;
	private final ApiUtils apiUtils;
	private final TokenUtils tokenUtils;

	// orderService에서 매도 전부 진행 후 CustomService에서 검증 과정 실행.
	public boolean verifyOrder() {
		Map<String, String> params = Map.of(
			"CANO", accountNumber,
			"ACNT_PRDT_CD", accountProductCode,
			"OVRS_EXCG_CD", "NASD",
			"SORT_SQN", "DS",
			"CTX_AREA_FK200", "",
			"CTX_AREA_NK200", ""
		);
		ResponseEntity<InquireNccsRes> response = apiUtils.getRequest(
			tokenUtils.createAuthorizationHeaders("TTTS3018R"),
			URL,
			params,
			InquireNccsRes.class
		);
		boolean hasUnsettled = Objects.requireNonNull(response.getBody()).output().stream()
			.anyMatch(inquireNccsOutputRes -> !inquireNccsOutputRes.nccsQty().equals("0"));
		return !hasUnsettled; // 미체결 없음
	}

	// 인터벌 설정?
}
