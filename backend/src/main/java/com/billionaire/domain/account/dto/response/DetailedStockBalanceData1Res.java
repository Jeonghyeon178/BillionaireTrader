package com.billionaire.domain.account.dto.response;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public record DetailedStockBalanceData1Res(
	String ovrsPdno,	// 티커
	String ovrsItemName,	// 풀네임
	String ordPsblQty,	// 주문가능수량 (매도 가능한 주문 수량)
	String ovrsStckEvluAmt,	// 주식평가금액 (해당 종목의 외화 기준 평가금액)
	String nowPric2	// 현재가격2 (해당 종목의 현재가)
) {
}
