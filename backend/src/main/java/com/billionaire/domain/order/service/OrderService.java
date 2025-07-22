package com.billionaire.domain.order.service;

import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.billionaire.domain.order.dto.internal.OrderDto;
import com.billionaire.global.util.ApiUtils;
import com.billionaire.global.util.TokenUtils;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RequiredArgsConstructor
@Service
public class OrderService {
	@Value("${ks.account-number}")
	private String accountNumber;
	@Value("${ks.account-product-code}")
	private String accountProductCode;
	private final ApiUtils apiUtils;
	private final TokenUtils tokenUtils;
	private static String URL = "https://openapi.koreainvestment.com:9443/uapi/overseas-stock/v1/trading/order";

	public void stockOrder(OrderDto orderDto) {
		// 매수, 매도 코드
		String apiCode = orderDto.orderType().getApiCode();

		// NASD : 나스닥, NYSE : 뉴욕, AMEX : 아멕스
		Map<String, String> params = Map.of(
			"CANO", accountNumber,
			"ACNT_PRDT_CD", accountProductCode,
			"OVRS_EXCG_CD", "NASD",
			"PDNO", orderDto.ticker(),
			"ORD_QTY", String.valueOf(orderDto.quantity()),
			"OVRS_ORD_UNPR", String.valueOf(orderDto.price()),
			"ORD_SVR_DVSN_CD", "0",
			"ORD_DVSN", "00"
		);

		ResponseEntity<String> response = apiUtils.getRequest(
			tokenUtils.createAuthorizationHeaders(apiCode),
			URL,
			params,
			String.class
		);

		log.info("{} {}{} 주문 성공 {}", orderDto.quantity(), orderDto.ticker(), orderDto.orderType(), response.getBody());
	}
}
