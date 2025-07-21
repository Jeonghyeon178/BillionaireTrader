package com.billionaire.global.dto;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

import jakarta.validation.constraints.NotBlank;

@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public record MarketPriceDetailedInfoRes(
	@NotBlank(message = "영업일은 필수입니다")
	String stckBsopDate,
	@NotBlank(message = "현재가는 필수입니다")
	String ovrsNmixPrpr
) {
}
