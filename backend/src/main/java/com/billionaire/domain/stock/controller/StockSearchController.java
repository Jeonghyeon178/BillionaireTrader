package com.billionaire.domain.stock.controller;

import java.util.List;

import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.billionaire.domain.stock.dto.internal.ListingInfoDto;
import com.billionaire.domain.stock.service.StockSearchService;

import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Validated
public class StockSearchController {
	private final StockSearchService stockSearchService;

	@GetMapping("/stocks/search")
	public List<ListingInfoDto> searchStocks(
		@RequestParam("q")
		@NotBlank(message = "검색어는 필수입니다")
		String query) {
		return stockSearchService.searchStocks(query);
	}
}
