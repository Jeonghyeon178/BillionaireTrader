package com.billionaire.domain.strategy.custom.dto.internal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record StockInfoDto(
	@NotBlank(message = "종목 코드는 필수입니다")
	String ticker,
	@NotBlank(message = "종목 이름은 필수입니다")
	String name,
	@NotNull(message = "시가총액은 필수입니다")
	@Min(value = 0, message = "시가총액은 0 이상이어야 합니다")
	Long marketCap,
	@NotNull(message = "금액은 필수입니다")
	@DecimalMin(value = "0.0", message = "금액은 0 이상이어야 합니다")
	Double amount
) {
}
