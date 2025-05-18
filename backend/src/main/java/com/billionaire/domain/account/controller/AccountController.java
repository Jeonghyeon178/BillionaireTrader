package com.billionaire.domain.account.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.billionaire.domain.account.dto.common.AccountBalanceDto;
import com.billionaire.domain.account.dto.response.AccountRes;
import com.billionaire.domain.account.service.AccountService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class AccountController {
	private final AccountService accountService;

	@GetMapping("/account")
	public AccountRes requestAccount() {
		AccountBalanceDto accountBalance = accountService.getAccountBalance();

		// list로 보내면 형태가 이상해짐
		return AccountRes.builder()
			.stockBalanceRes(accountBalance.stockBalanceRes())
			.cashBalanceRes(accountBalance.cashBalanceRes())
			.build();
	}

}
