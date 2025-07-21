package com.billionaire.domain.stock.controller;

import java.util.List;

import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.billionaire.domain.stock.dto.response.StockRes;
import com.billionaire.domain.stock.service.StockService;

import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Validated
public class StockController {
	private final StockService stockService;

	@GetMapping("/stocks/{ticker}")
	public List<StockRes> searchStocks(
		@PathVariable
		@NotBlank(message = "종목 코드는 필수입니다")
		String ticker) {
		return stockService.getStockData(ticker);
	}
}
