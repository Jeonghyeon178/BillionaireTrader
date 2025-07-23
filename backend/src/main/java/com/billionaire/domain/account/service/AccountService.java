package com.billionaire.domain.account.service;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.billionaire.domain.account.dto.internal.AccountBalanceDto;
import com.billionaire.domain.account.dto.response.CashBalanceRes;
import com.billionaire.domain.account.dto.response.StockBalanceRes;
import com.billionaire.domain.account.exception.AccountNotFoundException;
import com.billionaire.global.util.ApiUtils;
import com.billionaire.global.util.TokenUtils;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

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

	public AccountBalanceDto getAccountBalance() {

		StockBalanceRes stockBalance = getStockBalance();
		CashBalanceRes cashBalance = getCashBalance();

		return AccountBalanceDto.builder()
			.stockBalanceRes(stockBalance)
			.cashBalanceRes(cashBalance)
			.build();
	}

	private StockBalanceRes getStockBalance() {
		try {
			Map<String, String> params = createStockBalanceParams();

			// 해외 주식 잔고 조회
			ResponseEntity<StockBalanceRes> response = apiUtils.getRequest(
				tokenUtils.createAuthorizationHeaders("TTTS3012R"),
				"https://openapi.koreainvestment.com:9443/uapi/overseas-stock/v1/trading/inquire-balance",
				params,
				StockBalanceRes.class
			);

			if (response.getBody() == null) {
				throw new AccountNotFoundException();
			}

			return response.getBody();
		} catch (Exception e) {
			throw new AccountNotFoundException();
		}
	}

	private CashBalanceRes getCashBalance() {
		try {
			Map<String, String> params = createStockBalanceParams();

			// 해외 증거금(현금 잔고) 조회
			ResponseEntity<CashBalanceRes> response = apiUtils.getRequest(
				tokenUtils.createAuthorizationHeaders("TTTC2101R", "P"),
				"https://openapi.koreainvestment.com:9443/uapi/overseas-stock/v1/trading/foreign-margin",
				params,
				CashBalanceRes.class
			);

			if (response.getBody() == null) {
				throw new AccountNotFoundException();
			}

			return response.getBody();
		} catch (Exception e) {
			throw new AccountNotFoundException();
		}
	}

	private Map<String, String> createStockBalanceParams() {
		if (accountNumber == null || accountNumber.trim().isEmpty()) {
			throw new AccountNotFoundException();
		}
		if (accountProductCode == null || accountProductCode.trim().isEmpty()) {
			throw new AccountNotFoundException();
		}

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
