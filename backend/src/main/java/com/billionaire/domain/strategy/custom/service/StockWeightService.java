package com.billionaire.domain.strategy.custom.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.billionaire.domain.strategy.custom.dto.internal.StockInfoDto;
import com.billionaire.domain.strategy.custom.dto.response.VerifiedDetailedData2Res;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RequiredArgsConstructor
@Service
public class StockWeightService {
	public List<StockInfoDto> createWeightedStockInfos(List<VerifiedDetailedData2Res> filteredStockList, double totalAmount) {
		long total = 0L;
		for (VerifiedDetailedData2Res stock : filteredStockList) {
			total += Long.parseLong(stock.valx());
		}

		List<StockInfoDto> stockInfos = new ArrayList<>();
		for (VerifiedDetailedData2Res stock : filteredStockList) {
			long marketCap = Long.parseLong(stock.valx());
			double weight = (double)marketCap / total;
			double weightedAmount = totalAmount * weight;

			log.info("[종목 비중] Ticker: {}, Name: {}, MarketCap: {}, WeightedAmount: {}", stock.symb(), stock.name(), marketCap, weightedAmount);

			stockInfos.add(new StockInfoDto(stock.symb(), stock.name(), marketCap, weightedAmount));
		}

		return stockInfos;
	}
}
