package com.billionaire.domain.account.dto.response;

import java.util.List;

public record StockBalanceRes(
	// String rtCd,
	// String msgCd,
	// String msg1,
	List<DetailedStockBalanceData1Res> output1,
	DetailedStockBalance2Res output2
) {
}
