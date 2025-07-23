package com.billionaire.domain.listing.dto.internal;

import jakarta.validation.constraints.NotBlank;

public record ListingInfoDto(
	@NotBlank(message = "거래소 이름은 필수입니다")
	String exchangeName,
	@NotBlank(message = "심볼은 필수입니다")
	String symbol,
	@NotBlank(message = "한글명은 필수입니다")
	String koreaName,
	@NotBlank(message = "영문명은 필수입니다")
	String englishName
) {
}
