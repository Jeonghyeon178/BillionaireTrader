package com.billionaire.domain.strategy.custom.scheduler;

import java.io.IOException;
import java.util.List;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.billionaire.domain.account.dto.common.AccountBalanceDto;
import com.billionaire.domain.account.dto.response.CashBalanceRes;
import com.billionaire.domain.account.dto.response.DetailedStockBalanceData1Res;
import com.billionaire.domain.account.dto.response.StockBalanceRes;
import com.billionaire.domain.account.service.AccountService;
import com.billionaire.domain.strategy.custom.dto.StockInfoDto;
import com.billionaire.domain.strategy.custom.dto.VerifiedDataRes;
import com.billionaire.domain.strategy.custom.dto.VerifiedDetailedData2Res;
import com.billionaire.domain.strategy.custom.service.MarketCapScraperService;
import com.billionaire.domain.strategy.custom.service.RebalanceService;
import com.billionaire.domain.strategy.custom.service.StockVerificationService;
import com.billionaire.domain.strategy.custom.service.StockWeightService;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class CustomScheduler {
	private final MarketCapScraperService marketCapScraperService;
	private final StockVerificationService stockVerificationService;
	private final StockWeightService stockWeightService;
	private final AccountService accountService;
	private final RebalanceService rebalanceService;

	// volatile을 쓰면?
	// 해당 변수는 항상 메인 메모리에서 값을 읽고 쓴다.
	// 즉, A 스레드가 값을 바꾸면, B 스레드는 항상 최신 값을 본다.
	// 쓰레드 간 가시성(visibility) 을 보장함.
	@Getter
	private volatile boolean enabled = true;

	public void enable() {
		this.enabled = true;
		log.info("✅ 리밸런싱 스케줄러 활성화");
	}

	public void disable() {
		this.enabled = false;
		log.info("❌ 리밸런싱 스케줄러 비활성화");
	}

	@Scheduled(cron = "0 55 4 * * MON-FRI")
	private void execute() throws IOException {
		if (!enabled) {
			log.info("⏸ 리밸런싱 스케줄러가 비활성화되어 실행되지 않음");
			return;
		}

		log.info("🚀 리밸런싱 스케줄러 실행 시작");

		Long minMarketCap = marketCapScraperService.getLargestMarketCap();
		Long maxMarketCap = minMarketCap * 10;

		VerifiedDataRes verifiedDataRes = stockVerificationService.verifyData(minMarketCap, maxMarketCap);
		if (verifiedDataRes != null && !verifiedDataRes.output2().isEmpty()) {
			List<VerifiedDetailedData2Res> filteredDataList =
				stockVerificationService.filterStocksByMarketCap(verifiedDataRes.output2());

			AccountBalanceDto accountBalance = accountService.getAccountBalance();
			StockBalanceRes stockBalanceRes = accountBalance.stockBalanceRes();
			CashBalanceRes cashBalanceRes = accountBalance.cashBalanceRes();

			double amount = Double.parseDouble(stockBalanceRes.output2().totEvluPflsAmt())
				+ Double.parseDouble(cashBalanceRes.output().get(0).frcrDnclAmt1());
			log.info("Current total amount (stock + cash): {}", amount);

			List<DetailedStockBalanceData1Res> ownStocks = stockBalanceRes.output1();
			List<StockInfoDto> stockInfoDtoList =
				stockWeightService.createWeightedStockInfos(filteredDataList, amount);

			rebalanceService.rebalance(ownStocks, stockInfoDtoList);
		}
	}
}