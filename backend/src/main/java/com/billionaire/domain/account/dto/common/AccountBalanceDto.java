package com.billionaire.domain.account.dto.common;

import com.billionaire.domain.account.dto.response.CashBalanceRes;
import com.billionaire.domain.account.dto.response.StockBalanceRes;

import lombok.Builder;

@Builder
public record AccountBalanceDto(
	StockBalanceRes stockBalanceRes,
	CashBalanceRes cashBalanceRes
) {
}
