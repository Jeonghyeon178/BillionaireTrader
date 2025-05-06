package com.backend.domain.account.dto.common;

import com.backend.domain.account.dto.response.CashBalanceRes;
import com.backend.domain.account.dto.response.StockBalanceRes;

import lombok.Builder;

@Builder
public record AccountBalanceDto(
	StockBalanceRes stockBalanceRes,
	CashBalanceRes cashBalanceRes
) {
}
