package com.billionaire.domain.account.dto.response;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;

@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
@Builder
public record AccountRes(
	@NotNull(message = "주식 잔고 응답은 필수입니다")
	@Valid
	StockBalanceRes stockBalanceRes,
	@NotNull(message = "현금 잔고 응답은 필수입니다")
	@Valid
	CashBalanceRes cashBalanceRes
) {
}
