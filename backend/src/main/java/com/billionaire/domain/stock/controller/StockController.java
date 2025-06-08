package com.billionaire.domain.stock.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import com.billionaire.domain.stock.entity.Stock;
import com.billionaire.domain.stock.service.StockService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class StockController {
	private final StockService stockService;

	@GetMapping("/search/{ticker}")
	public List<Stock> searchStocks(@PathVariable String ticker) {
		return stockService.getStockData(ticker);
	}
}
