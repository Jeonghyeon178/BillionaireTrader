package com.billionaire.domain.stock.controller;

import java.util.List;

import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.billionaire.domain.stock.entity.Stock;
import com.billionaire.domain.stock.service.StockService;
import com.billionaire.global.validation.annotation.ValidTicker;

import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Validated // Path Variable 검증을 위해 필요
public class StockController {
	private final StockService stockService;

	@GetMapping("/stocks/{ticker}")
	public List<Stock> searchStocks(
		@PathVariable
		@NotBlank(message = "종목 코드는 필수입니다")
		@ValidTicker
		String ticker) {
		return stockService.getStockData(ticker);
	}
}
