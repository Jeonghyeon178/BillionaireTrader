package com.backend.domain.token.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.backend.domain.token.service.TokenService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class TokenController {
	private final TokenService tokenService;

	@GetMapping("/token")
	public void requestAccessToken() {
		tokenService.validateOrRefreshToken();
	}
}
