package com.backend.domain.auto_trading.controller;

import java.io.IOException;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.backend.domain.auto_trading.service.AutoTradingService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class AutoTradingController {
	private final AutoTradingService autoTradingService;

	@GetMapping("/search")
	public void searchStocks() throws IOException {
		autoTradingService.searchStocks();
	}

}
