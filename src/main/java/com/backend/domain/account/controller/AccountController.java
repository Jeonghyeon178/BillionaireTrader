package com.backend.domain.account.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.backend.domain.account.service.AccountService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class AccountController {
	private final AccountService connectionService;

	@GetMapping("/token")
	public void requestAccessToken() {
		connectionService.checkValidToken();
	}

	@GetMapping("/account")
	public void requestAccount() {
		connectionService.getAccount();
	}

}
