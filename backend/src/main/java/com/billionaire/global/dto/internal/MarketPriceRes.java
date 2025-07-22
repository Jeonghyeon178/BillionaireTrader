package com.billionaire.global.dto.internal;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

public record MarketPriceRes(
	@NotNull(message = "시장 가격 데이터는 필수입니다")
	@Valid
	List<MarketPriceDetailedInfoRes> output2
) {
}
