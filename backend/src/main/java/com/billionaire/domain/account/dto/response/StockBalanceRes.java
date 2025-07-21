package com.billionaire.domain.account.dto.response;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

public record StockBalanceRes(
	@NotNull(message = "주식 잔고 데이터는 필수입니다")
	@Valid
	List<DetailedStockBalanceData1Res> output1,
	@NotNull(message = "주식 잔고 요약 데이터는 필수입니다")
	@Valid
	DetailedStockBalance2Res output2
) {
}
