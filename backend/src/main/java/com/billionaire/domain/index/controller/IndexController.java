package com.billionaire.domain.index.controller;

import java.util.ArrayList;
import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.billionaire.domain.index.entity.Index;
import com.billionaire.domain.index.service.IndexService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class IndexController {
	private final IndexService indexService;

	@GetMapping("/index")
	public List<List<Index>> searchIndex() {
		// 각 지수 데이터를 읽어서 변수에 저장
		List<Index> dow = indexService.getIndexData(".DJI", "N");
		List<Index> nas = indexService.getIndexData("COMP", "N");
		List<Index> snp = indexService.getIndexData("SPX", "N");
		List<Index> dw = indexService.getIndexData("FX@KRW", "X");

		// 결과를 리스트에 추가
		List<List<Index>> resultList = new ArrayList<>();
		resultList.add(dow);
		resultList.add(nas);
		resultList.add(snp);
		resultList.add(dw);

		// 리스트 반환
		return resultList;
	}

	@GetMapping("/nasdaq")
	public List<Index> outputNasdaqData() {
		return indexService.getIndexData("COMP", "N");
	}
}
