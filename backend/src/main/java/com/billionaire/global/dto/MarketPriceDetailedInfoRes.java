package com.billionaire.global.dto;

public record MarketPriceDetailedInfoRes(
	String stckBsopDate,    // 영업일
	String ovrsNmixPrpr        // 현재가
) {
}
