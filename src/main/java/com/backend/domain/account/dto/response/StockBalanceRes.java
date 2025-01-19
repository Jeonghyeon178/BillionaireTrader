package com.backend.domain.account.dto.response;

import java.util.List;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public record StockBalanceRes(
	// String rtCd,
	// String msgCd,
	// String msg1,
	List<StockBalanceOutPut1Res> output1,
	StockBalanceOutPut2Res output2
) {
}
