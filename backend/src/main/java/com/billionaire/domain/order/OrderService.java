package com.billionaire.domain.order;

import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.billionaire.domain.order.model.Order;
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
	static String URL = "https://openapi.koreainvestment.com:9443/uapi/overseas-stock/v1/trading/order";

	public void stockOrder(Order order) {
		// 매수, 매도 코드
		String apiCode = order.orderType().getApiCode();

		// NASD : 나스닥, NYSE : 뉴욕, AMEX : 아멕스
		Map<String, String> params = Map.of(
			"CANO", accountNumber,
			"ACNT_PRDT_CD", accountProductCode,
			"OVRS_EXCG_CD", "NASD",
			"PDNO", order.ticker(),
			"ORD_QTY", String.valueOf(order.quantity()),
			"OVRS_ORD_UNPR", String.valueOf(order.price()),
			"ORD_SVR_DVSN_CD", "0",
			"ORD_DVSN", "00"
		);

		ResponseEntity<String> response = apiUtils.getRequest(
			tokenUtils.createAuthorizationBody(apiCode),
			URL,
			params,
			String.class
		);
		// TODO 로그 제대로 찍기.
		log.info("{} {}{} 주문 성공 {}", order.quantity(), order.ticker(), order.orderType(), response.getBody());
	}
}
