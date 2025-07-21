package com.billionaire.domain.index.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.billionaire.domain.index.entity.Index;
import com.billionaire.domain.index.service.IndexService;
import com.billionaire.domain.index.type.MarketIndex;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class IndexController {
	private final IndexService indexService;

	@GetMapping("/indices/{name}")
	public List<Index> searchIndex(@PathVariable String name) {
		MarketIndex marketIndex = MarketIndex.fromPath(name);
		return indexService.getIndexData(marketIndex.getTicker(), marketIndex.getMarket());
	}
}
