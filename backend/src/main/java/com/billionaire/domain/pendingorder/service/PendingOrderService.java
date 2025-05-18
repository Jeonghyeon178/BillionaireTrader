package com.billionaire.domain.pendingorder.service;

import java.util.Map;
import java.util.Objects;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.billionaire.domain.pendingorder.dto.InquireNccsRes;
import com.billionaire.global.util.ApiUtils;
import com.billionaire.global.util.TokenUtils;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RequiredArgsConstructor
@Service
public class PendingOrderService {
	static String url = "https://openapi.koreainvestment.com:9443/uapi/overseas-stock/v1/trading/inquire-nccs";
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
			tokenUtils.createAuthorizationBody("TTTS3018R"),
			url,
			params,
			InquireNccsRes.class
		);
		// TODO dto 파일 수정
		boolean hasUnsettled = Objects.requireNonNull(response.getBody()).output().stream()
			.anyMatch(inquireNccsOutputRes -> !inquireNccsOutputRes.nccsQty().equals("0"));
		if (!hasUnsettled) {
			return true; // 미체결 없음
		}

		return false;
	}

	// 인터벌 설정?

	//
}
