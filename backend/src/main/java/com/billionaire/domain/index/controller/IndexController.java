package com.billionaire.domain.index.controller;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import com.billionaire.domain.index.dto.IndexSummaryRes;
import com.billionaire.domain.index.entity.Index;
import com.billionaire.domain.index.service.IndexService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class IndexController {
	private final IndexService indexService;

	@GetMapping("/index")
	public List<IndexSummaryRes> searchIndex() {
		List<Index> all = new ArrayList<>();

		all.addAll(indexService.getIndexData(".DJI", "N"));
		all.addAll(indexService.getIndexData("COMP", "N"));
		all.addAll(indexService.getIndexData("SPX", "N"));
		all.addAll(indexService.getIndexData("FX@KRW", "X"));

		return all.stream()
			.collect(Collectors.groupingBy(Index::getTicker)) // 티커별로 그룹화
			.values().stream()
			.map(list -> {
				Index latest = list.stream()
					.max(Comparator.comparing(Index::getDate))
					.orElseThrow();
				return new IndexSummaryRes(
					latest.getTicker(),
					Math.round(latest.getRate() * 100.0) / 100.0,
					latest.getPrice()
				);
			})
			.toList();
	}

	@GetMapping("/index/{ticker}")
	public List<Index> getNasdaqData(@PathVariable String ticker) {
		if (ticker.equals("COMP")) {
			return indexService.getIndexData("COMP", "N");
		}
		if (ticker.equals(".DJI")) {
			return indexService.getIndexData(".DJI", "N");
		}
		if (ticker.equals("SPX")) {
			return indexService.getIndexData("SPX", "N");
		}
		if (ticker.equals("FX@KRW")) {
			return indexService.getIndexData("FX@KRW", "X");
		}
		throw new IllegalArgumentException("Unknown ticker: " + ticker);
	}
}
