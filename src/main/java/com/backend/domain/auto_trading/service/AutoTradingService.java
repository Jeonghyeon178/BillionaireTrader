package com.backend.domain.auto_trading.service;

import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.backend.domain.account.dto.response.BalanceOutPut1Res;
import com.backend.domain.account.dto.response.BalanceRes;
import com.backend.domain.account.service.AccountService;
import com.backend.domain.auto_trading.dto.common.NasdaqTriggerInfo;
import com.backend.domain.auto_trading.dto.common.StockInfo;
import com.backend.domain.auto_trading.dto.response.NasdaqInfoRes;
import com.backend.domain.auto_trading.dto.response.StockCurrentRes;
import com.backend.domain.auto_trading.dto.response.StockInfoOutputRes;
import com.backend.domain.auto_trading.dto.response.StockInfoRes;
import com.backend.domain.auto_trading.dto.response.StockOutPut2Res;
import com.backend.domain.auto_trading.dto.response.StockRes;
import com.backend.domain.auto_trading.entity.Nasdaq;
import com.backend.domain.auto_trading.entity.PeekStockData;
import com.backend.domain.auto_trading.repository.NasdaqRepository;
import com.backend.domain.auto_trading.repository.PeekStockDataRepository;
import com.backend.global.util.ApiUtils;
import com.backend.global.util.TokenUtils;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class AutoTradingService {
	private final PeekStockDataRepository peekStockDataRepository;
	private final NasdaqRepository nasdaqRepository;

	private final TokenUtils tokenUtils;
	private final ApiUtils apiUtils;

	private final AccountService accountService;

	@Value("${ks.account-number}")
	private String accountNumber;
	@Value("${ks.account-product-code}")
	private String accountProductCode;

	// 17시 이후 사용 가능. (18시)
	public void searchStocks() throws IOException {

		HttpHeaders httpheaders = tokenUtils.createAuthorizationBody("HHDFS76410000");

		String URL = "https://openapi.koreainvestment.com:9443/uapi/overseas-price/v1/quotations/inquire-search";
		// 스크래핑 통해 가져온 데이터와 괴리가 존재할 수 있음..
		// 넉넉잡아서 min값을 설정한 뒤 불러온 데이터 기준으로 필터링?
		Long minMarketCap = Math.round(getMarketCap() * 0.9);
		Long maxMarketCap = minMarketCap * 10;

		Map<String, String> parameters = new HashMap<>();
		parameters.put("AUTH", "");
		parameters.put("EXCD", "NAS");
		parameters.put("CO_YN_VALX", "1");
		parameters.put("CO_ST_VALX", String.valueOf(minMarketCap));
		parameters.put("CO_EN_VALX", String.valueOf(maxMarketCap));

		ResponseEntity<StockRes> response = apiUtils.getRequest(httpheaders, URL, parameters, StockRes.class);

		log.info("Response body: {}", response.getBody());

		StockRes stockRes = response.getBody();
		if (stockRes != null && !stockRes.output2().isEmpty()) {
			List<StockOutPut2Res> stockList = stockRes.output2();
			Long totalMarketCap = 0L;
			Long largestMarketCap = 0L;

			// 1. 전체 시가총액 합산 (stockList 다시 필터링)
			List<StockOutPut2Res> filteredStockList = new ArrayList<>();
			for (StockOutPut2Res stock : stockList) {
				Long marketCap = Long.valueOf(stock.valx());

				// 첫 번째 항목에서 가장 큰 시가총액을 설정
				if (largestMarketCap == 0L) {
					largestMarketCap = marketCap;
				}

				// 시가총액이 largestMarketCap의 90% 이상인 경우 합산 및 필터링 리스트 추가
				if (marketCap >= largestMarketCap * 0.9) {
					totalMarketCap += marketCap;
					filteredStockList.add(stock);
				} else {
					break;
				}
			}
			// 만약 기존 주식을 갖고 있다면?
			// TODO 맵으로 담는 방법을 고려. 시간복잡도 우려.
			ResponseEntity<BalanceRes> balanceResResponseEntity = accountService.getAccount();
			Double amount = Double.valueOf(balanceResResponseEntity.getBody().output2().totEvluPflsAmt());
			List<BalanceOutPut1Res> ownStocks = balanceResResponseEntity.getBody().output1();

			log.info("Current amount: {}", amount);

			// 2. 각 종목의 비중 계산
			List<StockInfo> stockInfos = new ArrayList<>();

			for (StockOutPut2Res stock : filteredStockList) {
				Long marketCap = Long.valueOf(stock.valx());
				double weight = (double)marketCap / totalMarketCap;

				// 가중치에 따라 적용할 금액 계산
				Double weightedAmount = amount * weight;

				log.info("Ticker: {}, Company: {}, Market Cap: {}, WeightedAmount: {}",
					stock.symb(), stock.name(), marketCap, weightedAmount);

				StockInfo stockInfo = new StockInfo(stock.symb(), stock.name(), marketCap, weightedAmount);
				stockInfos.add(stockInfo);
			}
			rebalanceStocks(stockInfos, ownStocks);
		}
	}

	private Long getMarketCap() throws IOException {
		String url = "https://kr.tradingview.com/markets/stocks-usa/market-movers-large-cap/";
		Document doc = Jsoup.connect(url).get();

		// 데이터를 담을 리스트를 초기화
		List<Map<String, Object>> marketCaps = new ArrayList<>();

		// 테이블의 모든 행을 찾음
		Elements rows = doc.select("table tbody tr");

		for (Element row : rows) {
			// 회사명 추출
			Element companyNameElement = row.selectFirst("td:nth-child(1) a");
			String companyName = companyNameElement != null ? companyNameElement.text().trim() : "N/A";

			// 시가총액 추출
			Element marketCapElement = row.selectFirst("td:nth-child(2)");
			String marketCapText = marketCapElement != null ? marketCapElement.text().trim() : "N/A";
			Long marketCap = marketCapElement != null ? parseMarketCap(marketCapText) : null;

			// 데이터를 리스트에 추가
			Map<String, Object> marketCapData = new HashMap<>();
			marketCapData.put("회사명", companyName);
			marketCapData.put("시가총액", marketCap);
			marketCapData.put("시가총액_텍스트", marketCapText);

			marketCaps.add(marketCapData);
		}

		Long result = (Long)marketCaps.get(0).get("시가총액");
		log.info("result = " + result);

		return result;
	}

	private Long parseMarketCap(String marketCapText) {
		// 시가총액 문자열을 숫자로 변환하는 로직
		Map<String, Long> multiplier = new HashMap<>();
		multiplier.put("B", 1_000_000L); // 10^9
		multiplier.put("T", 1_000_000_000L); // 10^12
		multiplier.put("M", 1_000L); // 10^6
		multiplier.put("K", 1L); // 10^3

		// 불필요한 문자와 좁은 공백 제거
		String cleanText = marketCapText.replace("\u202F", " ").replace("USD", "").trim();

		String[] parts = cleanText.split("\\s");
		if (parts.length < 2)
			return null;

		try {
			// 첫 번째 부분은 숫자, 두 번째 부분은 단위(B, T, M, K)
			double number = Double.parseDouble(parts[0].replace(",", ""));
			String unit = parts[1].substring(0, 1); // T, B, M, K 중 하나

			// 해당 단위에 맞는 값을 곱해서 반환
			return (long)(number * multiplier.getOrDefault(unit, 1L));
		} catch (NumberFormatException e) {
			return null;
		}
	}

	private void rebalanceStocks(List<StockInfo> stocks, List<BalanceOutPut1Res> outputs) {

		HttpHeaders httpheaders = tokenUtils.createAuthorizationBody("FHKST03030100");
		String URL = "https://openapi.koreainvestment.com:9443/uapi/overseas-price/v1/quotations/inquire-daily-chartprice";
		DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMdd");
		LocalDate date = LocalDate.now();
		String formattedDate = date.format(formatter);

		Map<String, String> parameters = new HashMap<>();
		parameters.put("FID_COND_MRKT_DIV_CODE", "N");
		parameters.put("FID_INPUT_DATE_2", formattedDate);
		parameters.put("FID_PERIOD_DIV_CODE", "D");

		// 나중가면 제로 금리도 고려
		NasdaqTriggerInfo info = readNasdaq();
		Boolean trigger = info.trigger();
		LocalDate localDate = info.date();

		for (StockInfo stock : stocks) {
			Optional<PeekStockData> optionalPeekStockData = peekStockDataRepository.findByTicker(stock.ticker());
			optionalPeekStockData.ifPresentOrElse(
				data -> parameters.put("FID_INPUT_DATE_1", String.valueOf(data.getUpdateDate())),
				() -> parameters.put("FID_INPUT_DATE_1", "20240102")
			);
			parameters.put("FID_INPUT_ISCD", stock.ticker());

			ResponseEntity<StockInfoRes> response = apiUtils.getRequest(httpheaders, URL, parameters, StockInfoRes.class);

			StockInfoOutputRes max = getHighestData(response.getBody().output2());

			StockInfoOutputRes min = getLowestDataAfterHighest(response.getBody().output2(), localDate);

			// TODO
			optionalPeekStockData.ifPresentOrElse(
				data -> {
					data.updateData(
						Double.valueOf(max.ovrsNmixPrpr()),
						Double.valueOf(min.ovrsNmixPrpr()),
						LocalDate.now()
					);
					peekStockDataRepository.save(data);
				},
				() -> {
					PeekStockData newData = PeekStockData.builder()
						.ticker(stock.ticker())
						.highestClosingPrice(Double.valueOf(max.ovrsNmixPrpr()))
						.lowestClosingPrice(Double.valueOf(min.ovrsNmixPrpr()))
						.updateDate(LocalDate.now())
						.build();
					peekStockDataRepository.save(newData);
				}
			);

			// 3개의 값이 모두 같은 경우가 발생할 수 있음.
			// 그리고 null 가져오는 문제.
			Double highestPrice = Double.valueOf(max.ovrsNmixPrpr());
			Double lowestPrice = Double.valueOf(min.ovrsNmixPrpr());
			Double currentPrice = getCurrentPrice(stock.ticker());

			BalanceOutPut1Res foundStock = outputs.stream()
				.filter(balanceOutPut1Res -> balanceOutPut1Res.ovrsPdno().equals(stock.ticker()))
				.findFirst()
				.orElse(null);
			Double ownAmount = Double.valueOf(foundStock.ovrsStckEvluAmt());
			// 일정 수량 판매, 일정 수량 매수

			if (trigger) {
				// 그리고 전저점 체크하고 전저점 대비 10% 상승 시 보유현금 전부 매수
				if (lowestPrice * 1.1 < currentPrice) {
					// 보유액수 뺀 나머지 매수 (amount - ownAmount) 근데 음수가 나오면? 그만큼 매도 진행.
					Double result = stock.amount() - ownAmount;

					if (result > 0) {
						log.info("풀 매수: {}", stock.amount());
						stockOrder(stock.ticker(), (int)(result/currentPrice), currentPrice, "BUY");
					} else {
						log.info("매도: {}", -result);
						stockOrder(stock.ticker(), (int)(result/currentPrice), currentPrice, "SELL");
					}
				}

				if (currentPrice < highestPrice) {
					Double totalDropPercentage = (highestPrice - currentPrice) / highestPrice;

					int dropCount = (int)(totalDropPercentage / 0.05);

					// 주식 매수 기존 보유액 체크 후 매수
					if (dropCount > 0) {
						double amountToPurchase = stock.amount() * 0.1 * dropCount; // 10%

						// 현재 해당 주식의 보유량 체크
						// amountToPurchase - ownAmount (마찬가지로 음수일 경우 그만큼 매도 진행)
						Double result = amountToPurchase - ownAmount;

						if (result > 0) {
							log.info("매수 액수: {}", result);
							stockOrder(stock.ticker(), (int)(result/currentPrice), currentPrice, "BUY");

						} else {
							log.info("매도: {}", -result);
							stockOrder(stock.ticker(), (int)(result/currentPrice), currentPrice, "SELL");
						}
					}
				}
			} else {
				// 하락 비율 계산
				// 주식 조회 후 전고점 대비 -2.5% 떨어질 때마다 10% 현금화 진행
				if (currentPrice < highestPrice) {
					Double totalDropPercentage = (highestPrice - currentPrice) / highestPrice;

					// 하락 비율이 2.5%의 배수인지 확인
					int dropCount = (int)(totalDropPercentage / 0.025);

					// 현금화 로직 실행
					if (dropCount > 0) {
						double amountToLiquidate = stock.amount() * 0.1 * dropCount; // 10%

						// 현금화 실행
						// ownAmount - amount (양수: 매도, 음수: 매수)
						// amount - amountToLiquidate (양수: 매수, 음수: 매도)
						log.info("현금화 액수: {}", amountToLiquidate);

						Double result = -(ownAmount - stock.amount()) + stock.amount() - amountToLiquidate;
						if (result > 0) {
							log.info("매수 액수: {}", result);
							stockOrder(stock.ticker(), (int)(result/currentPrice), currentPrice, "BUY");
						} else {
							log.info("현금화 액수: {}", result);
							stockOrder(stock.ticker(), (int)(result/currentPrice), currentPrice, "SELL");
						}
					}
				}
			}

		}
	}

	// TODO check to exist gap
	private NasdaqTriggerInfo readNasdaq() {
		// api 대체할만한게 있는지..

		HttpHeaders httpheaders = tokenUtils.createAuthorizationBody("FHKST03030100");
		String URL = "https://openapi.koreainvestment.com:9443/uapi/overseas-price/v1/quotations/inquire-daily-chartprice";
		DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMdd");
		LocalDate today = LocalDate.now();
		LocalDate yesterday = today.minusDays(1);
		String formattedToday = today.format(formatter);
		String formattedYesterday = yesterday.format(formatter);

		Map<String, String> parameters = new HashMap<>();
		parameters.put("FID_COND_MRKT_DIV_CODE", "N");
		parameters.put("FID_INPUT_ISCD", "COMP");
		parameters.put("FID_INPUT_DATE_1", formattedYesterday);
		parameters.put("FID_INPUT_DATE_2", formattedToday);
		parameters.put("FID_PERIOD_DIV_CODE", "D");

		ResponseEntity<NasdaqInfoRes> response = apiUtils.getRequest(httpheaders, URL, parameters, NasdaqInfoRes.class);

		Double result = Double.parseDouble(response.getBody().output1().prdyCtrt());
		log.info("나스닥 지수 조회 성공 {}", result);

		Optional<Nasdaq> optionalNasdaq = nasdaqRepository.findById(1L);
		Nasdaq nasdaq = optionalNasdaq.orElseGet(
			() -> Nasdaq.builder()
				.trigger(true)
				.tradingDate(LocalDate.of(2024, 9, 3))
				.numberOfConsecutiveRises(0L)
				.build()
		);

		if (result <= -3) {
			nasdaq.updateNasdaqData(today, 0L, true);

		} else if (result > 0) {
			nasdaq.updateNasdaqData(nasdaq.getNumberOfConsecutiveRises() + 1);
		} else {
			nasdaq.updateNasdaqData(0L);
		}

		if (nasdaq.getTrigger()) {
			if (nasdaq.getTradingDate().isBefore(today.minusMonths(1).minusDays(15))) {
				// tradingDate가 1.5달 전보다 이전일 때
				if (nasdaq.getNumberOfConsecutiveRises() >= 8) {
					nasdaq.updateNasdaqData(false);
				}
			}
			if (nasdaq.getTradingDate().isBefore(today.minusMonths(2))) {
				nasdaq.updateNasdaqData(false);
			}
		}
		nasdaqRepository.save(nasdaq);

		return new NasdaqTriggerInfo(nasdaq.getTrigger(), nasdaq.getTradingDate());
	}

	private StockInfoOutputRes getHighestData(List<StockInfoOutputRes> outputRes) {
		return outputRes.stream()
			.max(Comparator.comparingDouble(item -> Double.parseDouble(item.ovrsNmixPrpr())))
			.orElseThrow(() -> new RuntimeException("나스닥 데이터 리스트가 비어있음."));
	}

	private StockInfoOutputRes getLowestDataAfterHighest(List<StockInfoOutputRes> outputRes, LocalDate highestDate) {

		DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMdd");
		if (LocalDate.now().equals(highestDate)) {
			return outputRes.stream()
				.filter(data -> LocalDate.parse(data.stckBsopDate(), formatter).equals(highestDate))
				.min(Comparator.comparingDouble(data -> Double.parseDouble(data.ovrsNmixPrpr())))
				.orElseThrow(() -> new RuntimeException("당일 최저가 데이터를 찾을 수 없음."));
		}

		return outputRes.stream()
			.filter(data -> LocalDate.parse(data.stckBsopDate(), formatter).isAfter(highestDate))
			.min(Comparator.comparingDouble(data -> Double.parseDouble(data.ovrsNmixPrpr())))
			.orElseThrow(() -> new RuntimeException("최고가 이후 최저가 데이터를 찾을 수 없음."));
	}

	private Double getCurrentPrice(String ticker) {

		HttpHeaders httpheaders = tokenUtils.createAuthorizationBody("HHDFS76200100", "P");

		String URL = "https://openapi.koreainvestment.com:9443/uapi/overseas-price/v1/quotations/inquire-asking-price";

		Map<String, String> parameters = new HashMap<>();
		parameters.put("AUTH", "");
		parameters.put("EXCD", "NAS");
		parameters.put("SYMB", ticker);

		ResponseEntity<StockCurrentRes> response = apiUtils.getRequest(httpheaders, URL, parameters, StockCurrentRes.class);
		log.info("{} 현재가 조회 성공 {}", ticker, response.getBody().output1().last());
		return Double.valueOf(response.getBody().output1().last());
	}

	private void stockOrder(String ticker, Integer quantity, Double price, String orderType) {
		String apiCode = orderType.equals("BUY") ? "TTTT1002U" : "TTTT1006U";
		HttpHeaders httpheaders = tokenUtils.createAuthorizationBody(apiCode);

		String URL = "https://openapi.koreainvestment.com:9443/uapi/overseas-stock/v1/trading/order";

		Map<String, String> parameters = new HashMap<>();
		parameters.put("CANO", accountNumber);
		parameters.put("ACNT_PRDT_CD", accountProductCode);
		parameters.put("OVRS_EXCG_CD", "NASD");
		parameters.put("PDNO", ticker);
		parameters.put("ORD_QTY", String.valueOf(quantity));
		parameters.put("OVRS_ORD_UNPR", String.valueOf(price));
		parameters.put("ORD_SVR_DVSN_CD", "0");
		parameters.put("ORD_DVSN", "00");

		ResponseEntity<String> response = apiUtils.getRequest(httpheaders, URL, parameters, String.class);

		log.info("{} {}{} 주문 성공 {}", quantity, ticker, orderType, response.getBody());
	}
}
