package com.billionaire.domain.account.dto.response;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public record DetailedStockBalanceData1Res(
	// String cano,
	// String acntPrdtCd,
	// String prdtTypeCd,
	String ovrsPdno,        // 티커
	String ovrsItemName,    // 풀네임
	// String frcrEvluPflsAmt,	// 외화평가손익금액
	// String evluPflsRt,		// 평가손익율
	// String pchsAvgPric,		// 매입평균가격
	// String ovrsCblcQty,		// 해외잔고수량
	String ordPsblQty,        // 주문가능수량 (매도 가능한 주문 수량)
	// String frcrPchsAmt1,	// 외화매입금액1 (해당 종목의 외화 기준 매입금액)
	String ovrsStckEvluAmt,    // 주식평가금액 (해당 종목의 외화 기준 평가금액)
	String nowPric2        // 현재가격2 (해당 종목의 현재가)
	// String trCrcyCd,
	// String ovrsExcgCd,		// 거래소 코드
	// String loanTypeCd,
	// String loanDt,
	// String expdDt
) {
}
