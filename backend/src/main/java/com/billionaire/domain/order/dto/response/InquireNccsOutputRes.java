package com.billionaire.domain.order.dto.response;

import jakarta.validation.constraints.NotBlank;

public record InquireNccsOutputRes(
	@NotBlank(message = "상품명은 필수입니다")
	String prdtName,
	@NotBlank(message = "거래 가능 수량은 필수입니다")
	String nccsQty
) {
}
