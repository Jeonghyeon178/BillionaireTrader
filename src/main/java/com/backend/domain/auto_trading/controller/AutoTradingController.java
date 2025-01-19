package com.backend.domain.auto_trading.controller;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.backend.domain.auto_trading.dto.response.IndicesRes;
import com.backend.domain.auto_trading.dto.response.NasdaqDataRes;
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

	@GetMapping("/indices")
	public List<IndicesRes> searchIndices() {
		// 각 지수 데이터를 읽어서 변수에 저장
		IndicesRes dow = autoTradingService.readIndices2(".DJI", "N");
		IndicesRes nas = autoTradingService.readIndices2("COMP", "N");
		IndicesRes snp = autoTradingService.readIndices2("SPX", "N");
		IndicesRes dw = autoTradingService.readIndices2("FX@KRW", "X");

		// 결과를 리스트에 추가
		List<IndicesRes> indicesList = new ArrayList<>();
		indicesList.add(dow);
		indicesList.add(nas);
		indicesList.add(snp);
		indicesList.add(dw);

		// 리스트 반환
		return indicesList;
	}

	@GetMapping("/nasdaq")
	public NasdaqDataRes outputNasdaqData() {
		return autoTradingService.outputNasdaqData();
	}
}
