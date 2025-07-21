package com.billionaire.domain.account.dto.response;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

import jakarta.validation.constraints.NotBlank;

@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public record DetailedStockBalanceData1Res(
	@NotBlank(message = "종목코드는 필수입니다")
	String ovrsPdno,
	@NotBlank(message = "종목명은 필수입니다")
	String ovrsItemName,
	@NotBlank(message = "주문가능수량은 필수입니다")
	String ordPsblQty,	//
	@NotBlank(message = "주식평가금액은 필수입니다")
	String ovrsStckEvluAmt,
	@NotBlank(message = "현재가격은 필수입니다")
	String nowPric2	//
) {
}
