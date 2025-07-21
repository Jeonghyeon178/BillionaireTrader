package com.billionaire.domain.account.dto.response;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

import jakarta.validation.constraints.NotBlank;

@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public record DetailedStockBalance2Res(
	@NotBlank(message = "총평가손익금액은 필수입니다")
	String totEvluPflsAmt
) {
}
