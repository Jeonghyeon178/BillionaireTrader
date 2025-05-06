package com.backend.domain.auto_trading.dto.response;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public record StockOutPut1Res(
	String zdiv,  // 소수점자리수
	String stat,  // 거래상태정보
	String crec,  // 현재조회종목수
	String trec,  // 전체조회종목수
	String nrec   // Record Count
) {
}
