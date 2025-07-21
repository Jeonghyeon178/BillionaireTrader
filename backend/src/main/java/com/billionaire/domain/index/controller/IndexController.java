package com.billionaire.domain.index.controller;

import java.util.List;

import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.billionaire.domain.index.dto.response.IndexRes;
import com.billionaire.domain.index.service.IndexService;
import com.billionaire.domain.index.type.MarketIndex;

import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Validated
public class IndexController {
	private final IndexService indexService;

	@GetMapping("/indices/{name}")
	public List<IndexRes> searchIndex(
		@PathVariable
		@NotBlank(message = "지수 이름은 필수입니다")
		String name) {
		MarketIndex marketIndex = MarketIndex.fromPath(name);
		return indexService.getIndexData(marketIndex.getTicker(), marketIndex.getMarket());
	}
}
