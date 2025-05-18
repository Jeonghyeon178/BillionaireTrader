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

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RequiredArgsConstructor
@Component
public class CustomScheduler {
	private final MarketCapScraperService marketCapScraperService;
	private final StockVerificationService stockVerificationService;
	private final StockWeightService stockWeightService;
	private final AccountService accountService;
	private final RebalanceService rebalanceService;

	// 스케줄러 파일로 전환 고려.
	@Scheduled(cron = "0 55 4 * * MON-FRI") // 월-금, 오전 4시 55분마다
	private void execute() throws IOException {
		Long minMarketCap = marketCapScraperService.getLargestMarketCap();
		Long maxMarketCap = minMarketCap * 10;

		VerifiedDataRes verifiedDataRes = stockVerificationService.verifyData(minMarketCap, maxMarketCap);
		// 결과가 있다면, 시총 상위 종목만 필터링
		if (verifiedDataRes != null && !verifiedDataRes.output2().isEmpty()) {
			List<VerifiedDetailedData2Res> verifiedDetailedData2ResList =
				verifiedDataRes.output2();
			List<VerifiedDetailedData2Res> filteredDataList =
				stockVerificationService.filterStocksByMarketCap(verifiedDetailedData2ResList);

			// 보유 잔고(주식+현금) 조회 → (계좌 서비스에서 AccountBalanceDto 반환)
			AccountBalanceDto accountBalance = accountService.getAccountBalance();
			StockBalanceRes stockBalanceRes = accountBalance.stockBalanceRes();
			CashBalanceRes cashBalanceRes = accountBalance.cashBalanceRes();

			// 주식 총평가액 + 외화예수금
			double amount = Double.parseDouble(stockBalanceRes.output2().totEvluPflsAmt()) + Double.parseDouble(cashBalanceRes.output().get(0).frcrDnclAmt1());
			log.info("Current total amount (stock + cash): {}", amount);

			// 실제로 보유 중인 종목 정보
			List<DetailedStockBalanceData1Res> ownStocks = stockBalanceRes.output1();

			// 시장 비중(가중치)에 따라 매수/매도할 목록(StockInfo) 생성 & 리밸런싱 실행
			List<StockInfoDto> stockInfoDtoList =
				stockWeightService.createWeightedStockInfos(filteredDataList, amount);

			rebalanceService.rebalance(ownStocks, stockInfoDtoList);
		}
	}
}
