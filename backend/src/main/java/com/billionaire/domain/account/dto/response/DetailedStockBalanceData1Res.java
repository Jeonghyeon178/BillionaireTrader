package com.billionaire.domain.account.dto.response;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

import jakarta.validation.constraints.NotBlank;

@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public record DetailedStockBalanceData1Res(
	@NotBlank(message = "종목 코드는 필수입니다")
	String ovrsPdno,
	@NotBlank(message = "종목명은 필수입니다")
	String ovrsItemName,
	@NotBlank(message = "주문 가능 수량은 필수입니다")
	String ordPsblQty,
	@NotBlank(message = "외화 매입 금액은 필수입니다.")
	String frcrPchsAmt1,
	@NotBlank(message = "주식 평가 금액은 필수입니다")
	String ovrsStckEvluAmt,
	@NotBlank(message = "현재 가격은 필수입니다")
	String nowPric2	//
) {
}
