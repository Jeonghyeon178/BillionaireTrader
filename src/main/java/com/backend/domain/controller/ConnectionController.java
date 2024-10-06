package com.backend.domain.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.backend.domain.service.ConnectionService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class ConnectionController {
	private final ConnectionService connectionService;

	@GetMapping()
	public void requestAccessToken(){
		connectionService.checkValidToken();
	}

	@GetMapping("/account")
	public void requestAccount() {
		connectionService.getAccount();
	}
}
