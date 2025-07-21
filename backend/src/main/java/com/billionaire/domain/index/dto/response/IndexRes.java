package com.billionaire.domain.index.dto.response;

import java.time.LocalDate;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Builder;

@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
@Builder
public record IndexRes(
	@NotBlank(message = "지수 코드는 필수입니다")
	String ticker,
	@NotNull(message = "날짜는 필수입니다")
	LocalDate date,
	@NotNull(message = "가격은 필수입니다")
	@Positive(message = "가격은 0보다 커야 합니다")
	Double price,
	@NotNull(message = "변동률은 필수입니다")
	Double rate
) {
}