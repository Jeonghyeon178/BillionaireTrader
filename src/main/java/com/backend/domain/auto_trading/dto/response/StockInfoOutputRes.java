package com.backend.domain.auto_trading.dto.response;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public record StockInfoOutputRes(
	String stckBsopDate,	// 영업일
	String ovrsNmixPrpr		// 현재가
) {
}
