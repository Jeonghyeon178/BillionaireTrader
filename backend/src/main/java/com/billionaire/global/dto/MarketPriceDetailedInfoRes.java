package com.billionaire.global.dto;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public record MarketPriceDetailedInfoRes(
	String stckBsopDate,    // 영업일
	String ovrsNmixPrpr     // 현재가
) {
}
