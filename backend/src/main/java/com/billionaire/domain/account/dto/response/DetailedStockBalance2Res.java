package com.billionaire.domain.account.dto.response;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

import jakarta.validation.constraints.NotBlank;

@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public record DetailedStockBalance2Res(
	@NotBlank(message = "외화 매입 금액은 필수입니다")
	String frcrPchsAmt1,
	@NotBlank(message = "총평가 손익 금액은 필수입니다")
	String totEvluPflsAmt
) {
}
