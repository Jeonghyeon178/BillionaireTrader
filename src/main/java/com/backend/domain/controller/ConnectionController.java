package com.backend.domain.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.backend.domain.service.ConnectionService;
import com.fasterxml.jackson.core.JsonProcessingException;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class ConnectionController {
	private final ConnectionService connectionService;

	@GetMapping()
	public void requestAccessToken() throws JsonProcessingException {
		connectionService.getAccessToken();
	}
}
