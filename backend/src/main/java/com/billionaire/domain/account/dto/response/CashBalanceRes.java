package com.billionaire.domain.account.dto.response;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

public record CashBalanceRes(
	@NotNull(message = "출력 데이터는 필수입니다")
	@Valid
	List<DetailedCashBalanceRes> output
) {
}
