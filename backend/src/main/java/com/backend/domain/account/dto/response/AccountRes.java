package com.backend.domain.account.dto.response;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

import lombok.Builder;

@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
@Builder
public record AccountRes(StockBalanceRes stockBalanceRes, CashBalanceRes cashBalanceRes) {
}
