package com.billionaire.domain.account.service;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.billionaire.domain.account.dto.common.AccountBalanceDto;
import com.billionaire.domain.account.dto.response.CashBalanceRes;
import com.billionaire.domain.account.dto.response.StockBalanceRes;
import com.billionaire.domain.token.service.TokenService;
import com.billionaire.global.util.ApiUtils;
import com.billionaire.global.util.TokenUtils;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class AccountService {

	@Value("${ks.account-number}")
	private String accountNumber;
	@Value("${ks.account-product-code}")
	private String accountProductCode;

	private final TokenUtils tokenUtils;
	private final ApiUtils apiUtils;
	private final TokenService tokenService;

	public AccountBalanceDto getAccountBalance() {

		tokenService.validateOrRefreshToken();

		StockBalanceRes stockBalance = getStockBalance();
		CashBalanceRes cashBalance = getCashBalance();

		return AccountBalanceDto.builder()
			.stockBalanceRes(stockBalance)
			.cashBalanceRes(cashBalance)
			.build();
	}

	private StockBalanceRes getStockBalance() {
		Map<String, String> params = createStockBalanceParams();

		// 해외 주식 잔고 조회
		ResponseEntity<StockBalanceRes> response = apiUtils.getRequest(
			tokenUtils.createAuthorizationBody("TTTS3012R"),
			"https://openapi.koreainvestment.com:9443/uapi/overseas-stock/v1/trading/inquire-balance",
			params,
			StockBalanceRes.class
		);

		StockBalanceRes stockBalance = response.getBody();

		log.info("해외 주식 잔고 응답: {}", stockBalance);

		return stockBalance;
	}

	private CashBalanceRes getCashBalance() {
		Map<String, String> params = createStockBalanceParams();

		// 해외 증거금(현금 잔고) 조회
		ResponseEntity<CashBalanceRes> response = apiUtils.getRequest(
			tokenUtils.createAuthorizationBody("TTTC2101R", "P"),
			"https://openapi.koreainvestment.com:9443/uapi/overseas-stock/v1/trading/foreign-margin",
			params,
			CashBalanceRes.class
		);

		CashBalanceRes cashBalance = response.getBody();

		log.info("해외 증거금(현금 잔고) 응답: {}", cashBalance);

		return cashBalance;
	}

	private Map<String, String> createStockBalanceParams() {
		Map<String, String> params = new HashMap<>();
		params.put("CANO", accountNumber);
		params.put("ACNT_PRDT_CD", accountProductCode);
		params.put("OVRS_EXCG_CD", "NASD");
		params.put("TR_CRCY_CD", "USD");
		params.put("CTX_AREA_FK200", "");
		params.put("CTX_AREA_NK200", "");
		return params;
	}

}
