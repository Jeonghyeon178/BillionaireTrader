package com.billionaire.domain.account.dto.response;

import java.util.List;

public record StockBalanceRes(
	List<DetailedStockBalanceData1Res> output1,
	DetailedStockBalance2Res output2
) {
}
