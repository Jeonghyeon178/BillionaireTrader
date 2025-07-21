package com.billionaire.domain.order.dto.response;

import java.util.List;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public record InquireNccsRes(
	@NotNull(message = "출력 데이터는 필수입니다")
	@Valid
	List<InquireNccsOutputRes> output
) {
}
