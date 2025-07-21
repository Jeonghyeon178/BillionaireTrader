package com.billionaire.domain.account.dto.internal;

import com.billionaire.domain.account.dto.response.CashBalanceRes;
import com.billionaire.domain.account.dto.response.StockBalanceRes;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;

@Builder
public record AccountBalanceDto(
	@NotNull(message = "주식 잔고 정보는 필수입니다")
	@Valid
	StockBalanceRes stockBalanceRes,
	@NotNull(message = "현금 잔고 정보는 필수입니다")
	@Valid
	CashBalanceRes cashBalanceRes
) {
}
