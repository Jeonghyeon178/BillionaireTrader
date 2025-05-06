package com.backend.domain.account.dto.response;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public record StockBalanceOutPut2Res(
	// String frcrPchsAmt1,	// 외화매입금액
	// String ovrsRlztPflsAmt,	// 실현손익금액
	// String ovrsTotPfls,		// 총손익
	// String rlztErngRt,		// 실현수익률
	String totEvluPflsAmt	// 총평가손익금액
	// String totPftrt,		// 총수익률
	// String frcrBuyAmtSmtl1,	// 외화매수금액합계1
	// String ovrsRlztPflsAmt2,// 외화매수금액합계2
	// String frcrBuyAmtSmtl2	// 외화매수금액합계3

) {
}
