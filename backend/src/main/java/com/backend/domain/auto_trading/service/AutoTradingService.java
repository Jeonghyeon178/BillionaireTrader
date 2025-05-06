package com.backend.domain.auto_trading.service;

import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.backend.domain.account.dto.common.AccountBalanceDto;
import com.backend.domain.account.dto.response.CashBalanceRes;
import com.backend.domain.account.dto.response.StockBalanceOutPut1Res;
import com.backend.domain.account.dto.response.StockBalanceRes;
import com.backend.domain.account.service.AccountService;
import com.backend.domain.auto_trading.dto.common.OrderTask;
import com.backend.domain.auto_trading.dto.common.StockInfo;
import com.backend.domain.auto_trading.dto.response.IndicesInfoRes;
import com.backend.domain.auto_trading.dto.response.IndicesRes;
import com.backend.domain.auto_trading.dto.response.InquireNccsRes;
import com.backend.domain.auto_trading.dto.response.NasdaqDataRes;
import com.backend.domain.auto_trading.dto.response.NasdaqOutput2Res;
import com.backend.domain.auto_trading.dto.response.StockCurrentRes;
import com.backend.domain.auto_trading.dto.response.StockInfoOutputRes;
import com.backend.domain.auto_trading.dto.response.StockInfoRes;
import com.backend.domain.auto_trading.dto.response.StockOutPut2Res;
import com.backend.domain.auto_trading.dto.response.StockRes;
import com.backend.domain.auto_trading.entity.Nasdaq;
import com.backend.domain.auto_trading.entity.Stock;
import com.backend.domain.auto_trading.repository.NasdaqRepository;
import com.backend.domain.auto_trading.repository.StockRepository;
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
	private static String largestCompany;
	private final NasdaqRepository nasdaqRepository;

	private final TokenUtils tokenUtils;
	private final ApiUtils apiUtils;

	private final AccountService accountService;

	@Value("${ks.account-number}")
	private String accountNumber;
	@Value("${ks.account-product-code}")
	private String accountProductCode;
	private final StockRepository stockRepository;

	// 17시 이후 사용 가능. (18시)
	public void searchStocks() throws IOException {

		// 시가총액 범위 결정: TradingView 스크래핑 통해 얻은 시총의 90% ~ 10배까지
		Long minMarketCap = Math.round(getLargestMarketCap() * 0.9);
		Long maxMarketCap = minMarketCap * 10;

		Map<String, String> params = new HashMap<>();
		params.put("AUTH", "");
		params.put("EXCD", "NAS");
		params.put("CO_YN_VALX", "1");
		params.put("CO_ST_VALX", String.valueOf(minMarketCap));
		params.put("CO_EN_VALX", String.valueOf(maxMarketCap));

		// 해외주식조건검색 API 호출
		ResponseEntity<StockRes> response = apiUtils.getRequest(tokenUtils.createAuthorizationBody("HHDFS76410000"),
			"https://openapi.koreainvestment.com:9443/uapi/overseas-price/v1/quotations/inquire-search", params, StockRes.class);

		StockRes stockRes = response.getBody();

		log.info("최상위 시가총액 기준 90% 이상 주식 조회 결과: {}", stockRes);

		// 결과가 있다면, 시총 상위 종목만 필터링
		if (stockRes != null && !stockRes.output2().isEmpty()) {
			List<StockOutPut2Res> stockList = stockRes.output2();
			List<StockOutPut2Res> filteredStockList = filterStocksByMarketCap(stockList);

			// 보유 잔고(주식+현금) 조회 → (계좌 서비스에서 AccountBalanceDto 반환)
			AccountBalanceDto accountBalance = accountService.getAccountBalance();
			StockBalanceRes stockBalanceRes = accountBalance.stockBalanceRes();
			CashBalanceRes cashBalanceRes = accountBalance.cashBalanceRes();

			// 주식 총평가액 + 외화예수금
			double amount = Double.parseDouble(stockBalanceRes.output2().totEvluPflsAmt()) + Double.parseDouble(cashBalanceRes.output().get(0).frcrDnclAmt1());
			log.info("Current total amount (stock + cash): {}", amount);

			// 실제로 보유 중인 종목 정보
			List<StockBalanceOutPut1Res> ownStocks = stockBalanceRes.output1();

			// 시장 비중(가중치)에 따라 매수/매도할 목록(StockInfo) 생성 & 리밸런싱 실행
			List<StockInfo> stockInfos = createWeightedStockInfos(filteredStockList, amount);

			rebalanceStocks(stockInfos, ownStocks);
		}
	}

	private Long getLargestMarketCap() throws IOException {
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
		// TODO
		largestCompany = (String)marketCaps.get(0).get("회사명");

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

	private List<StockOutPut2Res> filterStocksByMarketCap(List<StockOutPut2Res> stockList) {
		// 시총 내림차순 정렬
		stockList.sort((s1, s2) -> Long.compare(Long.parseLong(s2.valx()), Long.parseLong(s1.valx())));

		List<StockOutPut2Res> filtered = new ArrayList<>();
		long largestMarketCap = Long.parseLong(stockList.get(0).valx());

		for (StockOutPut2Res stock : stockList) {
			long marketCap = Long.parseLong(stock.valx());
			if (marketCap >= (long)(largestMarketCap * 0.9)) {
				filtered.add(stock);
			} else {
				break;
			}
		}
		return filtered;
	}

	private List<StockInfo> createWeightedStockInfos(List<StockOutPut2Res> filteredStockList, double totalAmount) {
		long total = 0L;
		for (StockOutPut2Res stock : filteredStockList) {
			total += Long.parseLong(stock.valx());
		}

		List<StockInfo> stockInfos = new ArrayList<>();
		for (StockOutPut2Res stock : filteredStockList) {
			long marketCap = Long.parseLong(stock.valx());
			double weight = (double)marketCap / total;
			double weightedAmount = totalAmount * weight;

			log.info("[종목 비중] Ticker: {}, Name: {}, MarketCap: {}, WeightedAmount: {}", stock.symb(), stock.name(), marketCap, weightedAmount);

			stockInfos.add(new StockInfo(stock.symb(), stock.name(), marketCap, weightedAmount));
		}

		return stockInfos;
	}

	private void rebalanceStocks(List<StockInfo> stocks, List<StockBalanceOutPut1Res> outputs) {

		DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMdd");
		LocalDate date = LocalDate.now();
		String formattedDate = date.format(formatter);

		Map<String, String> parameters = new HashMap<>();
		parameters.put("FID_COND_MRKT_DIV_CODE", "N");
		parameters.put("FID_INPUT_DATE_2", formattedDate);
		parameters.put("FID_PERIOD_DIV_CODE", "D");

		List<OrderTask> sellOrders = new ArrayList<>();
		List<OrderTask> buyOrders = new ArrayList<>();

		// 나스닥 지수 분석
		// 나중가면 제로 금리도 고려
		Boolean trigger = readIndices();

		// 나중에 outputs가 null인지 체크해야함.
		// 1. 정보와 다른 주식을 들고 있으면 전량 매도.
		for (StockBalanceOutPut1Res holdingStock : outputs) {
			Optional<StockInfo> targets = stocks.stream().filter(stockInfo -> stockInfo.ticker().equals(holdingStock.ovrsPdno())).findFirst();
			if (targets.isEmpty() && !holdingStock.ovrsPdno().equals("")) {
				log.info("{} 전량매도", holdingStock.ovrsItemName());
				sellOrders.add(new OrderTask(holdingStock.ovrsPdno(), Integer.valueOf(holdingStock.ordPsblQty()), Double.valueOf(holdingStock.nowPric2()), "SELL"));
				outputs.remove(holdingStock.ovrsPdno());
				// stockOrder(holdingStock.ovrsPdno(), Integer.valueOf(holdingStock.ordPsblQty()), Double.valueOf(holdingStock.nowPric2()), "SELL");
			}
		}

		for (StockInfo stock : stocks) {
			Optional<Stock> optionalStock = stockRepository.findTopByTickerOrderByDateDesc(stock.ticker());
			// 들어있는지 유무 체크
			optionalStock.ifPresentOrElse(data -> parameters.put("FID_INPUT_DATE_1", String.valueOf(data.getDate())), () -> parameters.put("FID_INPUT_DATE_1", "20240102")
				// 일단은 전체 데이터가 아닌 해당 날짜 기준부터..
			);

			parameters.put("FID_INPUT_ISCD", stock.ticker());

			ResponseEntity<StockInfoRes> response = apiUtils.getRequest(tokenUtils.createAuthorizationBody("FHKST03030100"),
				"https://openapi.koreainvestment.com:9443/uapi/overseas-price/v1/quotations/inquire-daily-chartprice", parameters, StockInfoRes.class);

			List<StockInfoOutputRes> stockData = Objects.requireNonNull(response.getBody()).output2();    // 메서드 호출 'output2'이(가) 'NullPointerException'을 생성할 수 있기 때문에..

			saveStockData(stockData, stock.ticker());
			Stock filteredHighestData = stockRepository.findTopByTickerOrderByPriceDesc(stock.ticker());
			Stock filteredLowestDataAfterHighestData = stockRepository.findTopByTickerAndDateAfterOrderByPriceAsc(stock.ticker(), filteredHighestData.getDate());

			double highestPrice = filteredHighestData.getPrice();
			double lowestPriceAfterHighestPrice = filteredLowestDataAfterHighestData.getPrice();
			double currentPrice = getCurrentPrice(stock.ticker());

			// 그냥 그래서 데이터를 해당 메서드로 넘기기 전에 데이터를 가공해야 할 듯.
			StockBalanceOutPut1Res foundStock = outputs.stream().filter(stockBalanceOutPut1Res -> stockBalanceOutPut1Res.ovrsPdno().equals(stock.ticker())).findFirst().orElse(null);
			// foundStock이 없으면 이 주식은 보유 중이 아님 → 이번 루프 스킵
			if (foundStock == null) {
				log.info("해당 주식은 보유 중이지 않아 스킵: {}", stock.ticker());
				continue;
			}

			double ownAmount = Double.parseDouble(foundStock.ovrsStckEvluAmt());

			// 매수 주문을 넣는 기준은 전체 보유금 기준으로 하는데 기존 주식을 보유함에 따라 매수 주문을 넣지 못하는 문제가 발생할 수 있음.
			// 그래서 모든 주식 매도 주문 체결 -> 모든 주식 매수 주문
			// 일정 수량 판매, 일정 수량 매수
			if (trigger) {
				// 그리고 전저점 체크하고 전저점 대비 10% 상승 시 보유현금 전부 매수
				if (lowestPriceAfterHighestPrice * 1.1 < currentPrice) {
					// 보유액수 뺀 나머지 매수 (amount - ownAmount) 근데 음수가 나오면? 그만큼 매도 진행.
					double result = stock.amount() - ownAmount;

					if (result > 0) {
						log.info("{} 매수: {}", stock.ticker(), stock.amount());
						buyOrders.add(new OrderTask(stock.ticker(), (int)(result / currentPrice), currentPrice, "BUY"));
						// stockOrder(stock.ticker(), (int)(result / currentPrice), currentPrice, "BUY");
					} else {
						log.info("{} 매도: {}", stock.ticker(), -result);
						sellOrders.add(new OrderTask(stock.ticker(), (int)(result / currentPrice), currentPrice, "SELL"));
						// stockOrder(stock.ticker(), (int)(result / currentPrice), currentPrice, "SELL");
					}
				}

				if (currentPrice < highestPrice) {
					double totalDropPercentage = (highestPrice - currentPrice) / highestPrice;

					int dropCount = (int)(totalDropPercentage / 0.05);

					// 주식 매수 기존 보유액 체크 후 매수
					if (dropCount > 0) {
						double amountToPurchase = stock.amount() * 0.1 * dropCount; // 10%

						// 현재 해당 주식의 보유량 체크
						// amountToPurchase - ownAmount (마찬가지로 음수일 경우 그만큼 매도 진행)
						double result = amountToPurchase - ownAmount;

						if (result > 0) {
							log.info("{} 매수: {}", stock.ticker(), result);
							buyOrders.add(new OrderTask(stock.ticker(), (int)(result / currentPrice), currentPrice, "BUY"));
							// stockOrder(stock.ticker(), (int)(result / currentPrice), currentPrice, "BUY");

						} else {
							log.info("{} 매도: {}", stock.ticker(), -result);
							sellOrders.add(new OrderTask(stock.ticker(), (int)(result / currentPrice), currentPrice, "SELL"));
							// stockOrder(stock.ticker(), (int)(result / currentPrice), currentPrice, "SELL");
						}
					}
				}
			} else {
				// 하락 비율 계산
				// 주식 조회 후 전고점 대비 -2.5% 떨어질 때마다 10% 현금화 진행
				if (currentPrice < highestPrice) {
					double totalDropPercentage = (highestPrice - currentPrice) / highestPrice;

					// 하락 비율이 2.5%의 배수인지 확인
					int dropCount = (int)(totalDropPercentage / 0.025);

					// 현금화 로직 실행
					if (dropCount > 0) {
						double amountToLiquidate = stock.amount() * 0.1 * dropCount; // 10%

						// 현금화 실행
						// ownAmount - amount (양수: 매도, 음수: 매수)
						// amount - amountToLiquidate (양수: 매수, 음수: 매도)
						log.info("현금화 액수: {}", amountToLiquidate);

						double result = -(ownAmount - stock.amount()) + stock.amount() - amountToLiquidate;
						if (result > 0) {
							log.info("매수 액수: {}", result);
							buyOrders.add(new OrderTask(stock.ticker(), (int)(result / currentPrice), currentPrice, "BUY"));
							// stockOrder(stock.ticker(), (int)(result / currentPrice), currentPrice, "BUY");
						} else {
							log.info("현금화 액수: {}", result);
							sellOrders.add(new OrderTask(stock.ticker(), (int)(result / currentPrice), currentPrice, "SELL"));
							// stockOrder(stock.ticker(), (int)(result / currentPrice), currentPrice, "SELL");
						}
					}
				}
			}
			untitled(sellOrders, buyOrders);
		}
	}

	private void untitled(List<OrderTask> sellOrders, List<OrderTask> buyOrders){
		// 1. 매도 주문
		sellOrders.forEach(orderTask -> stockOrder(
			orderTask.ticker(),
			orderTask.quantity(),
			orderTask.price(),
			orderTask.orderType()
		));

		// 2. 체결 대기 (예: 최대 30초 동안 3초마다 polling)
		boolean allSellSettled = waitUntilSellOrdersSettled(30, 3);  // timeout: 30s, interval: 3s


		if (allSellSettled) {
			log.info("✅ 매도 주문 체결 확인 완료, 매수 주문 진행");
			buyOrders.forEach(orderTask -> stockOrder(
				orderTask.ticker(),
				orderTask.quantity(),
				orderTask.price(),
				orderTask.orderType()
			));
		} else {
			// TODO 나중에 제대로 확인해보기.
			log.warn("⚠️ 매도 주문 체결 실패 또는 타임아웃. 매수 주문 생략됨");
		}
		log.info("done");

	}

	private boolean waitUntilSellOrdersSettled(int timeoutSeconds, int pollIntervalSeconds) {
		int waited = 0;

		while (waited < timeoutSeconds) {
			try {
				Thread.sleep(pollIntervalSeconds * 1000L);
			} catch (InterruptedException e) {
				Thread.currentThread().interrupt();
				return false;
			}

			// 🟡 실제 미체결 조회 API 호출
			HttpHeaders httpHeaders = tokenUtils.createAuthorizationBody("TTTS3018R");
			String URL = "https://openapi.koreainvestment.com:9443/uapi/overseas-stock/v1/trading/inquire-nccs";

			Map<String, String> parameters = new HashMap<>();
			parameters.put("CANO", accountNumber);
			parameters.put("ACNT_PRDT_CD", accountProductCode);
			parameters.put("OVRS_EXCG_CD", "NASD");
			parameters.put("SORT_SQN", "DS");
			parameters.put("CTX_AREA_FK200", "");
			parameters.put("CTX_AREA_NK200", "");

			ResponseEntity<InquireNccsRes> response = apiUtils.getRequest(httpHeaders, URL, parameters, InquireNccsRes.class);

			boolean hasUnsettled = Objects.requireNonNull(response.getBody()).output().stream()
				.anyMatch(inquireNccsOutputRes -> !inquireNccsOutputRes.nccsQty().equals("0"));

			if (!hasUnsettled) {
				return true; // 미체결 없음
			}

			log.info("⏳ 미체결 매도 주문 존재. 현재 시간 {}", LocalDateTime.now());
			waited += pollIntervalSeconds;
		}

		return false; // 타임아웃됨
	}

	public IndicesRes readIndices2(String ticker, String code) {
		// api 대체할만한게 있는지..

		HttpHeaders httpheaders = tokenUtils.createAuthorizationBody("FHKST03030100");
		String URL = "https://openapi.koreainvestment.com:9443/uapi/overseas-price/v1/quotations/inquire-daily-chartprice";
		DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMdd");
		LocalDate today = LocalDate.now();
		LocalDate yesterday = today.minusDays(1);
		String formattedToday = today.format(formatter);
		String formattedYesterday = yesterday.format(formatter);

		Map<String, String> parameters = new HashMap<>();
		parameters.put("FID_COND_MRKT_DIV_CODE", code);
		parameters.put("FID_INPUT_ISCD", ticker);
		parameters.put("FID_INPUT_DATE_1", formattedYesterday);
		parameters.put("FID_INPUT_DATE_2", formattedToday);
		parameters.put("FID_PERIOD_DIV_CODE", "D");

		ResponseEntity<IndicesInfoRes> response = apiUtils.getRequest(httpheaders, URL, parameters, IndicesInfoRes.class);
		log.info(String.valueOf(response.getBody()));
		IndicesInfoRes res = response.getBody();

		return IndicesRes.builder().name(ticker).value(Float.valueOf(res.output1().ovrsNmixPrpr())).rate(Float.valueOf(res.output1().prdyCtrt())).build();
	}

	private Boolean readIndices() {
		Optional<Nasdaq> optionalNasdaq = nasdaqRepository.findTopByOrderByDateDesc();

		DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMdd");
		LocalDate previousUpdateDate = optionalNasdaq
			.map(Nasdaq::getDate)
			.orElse(LocalDate.parse("20240101", formatter));

		// 시가, 현재가로 조회 -> db에 저장 -> 데이터 꺼내서 해당 트리거 로직 구현
		HttpHeaders httpheaders = tokenUtils.createAuthorizationBody("FHKST03030100");
		String URL = "https://openapi.koreainvestment.com:9443/uapi/overseas-price/v1/quotations/inquire-daily-chartprice";
		LocalDate today = LocalDate.now();

		if (!today.equals(previousUpdateDate)) {
			String formattedToday = today.format(formatter);
			String formattedPreviousUpdateDate = previousUpdateDate.format(formatter);

			Map<String, String> parameters = new HashMap<>();
			parameters.put("FID_COND_MRKT_DIV_CODE", "N");
			parameters.put("FID_INPUT_ISCD", "COMP");
			parameters.put("FID_INPUT_DATE_1", formattedPreviousUpdateDate);
			parameters.put("FID_INPUT_DATE_2", formattedToday);
			parameters.put("FID_PERIOD_DIV_CODE", "D");

			ResponseEntity<NasdaqDataRes> response = apiUtils.getRequest(httpheaders, URL, parameters, NasdaqDataRes.class);
			List<NasdaqOutput2Res> nasdaqData = Objects.requireNonNull(response.getBody()).output2();

			saveNasdaqData(nasdaqData);
		}

		Nasdaq latestMinusThreeNasdaq = nasdaqRepository.findTopByRateLessThanEqualOrderByDateDesc(-3.0);

		LocalDate dateOfNasdaq = latestMinusThreeNasdaq.getDate();
		LocalDate twoMonthsAgo = LocalDate.now().minusMonths(2);
		LocalDate oneAndHalfMonthsAgo = LocalDate.now().minusDays(45);

		if (dateOfNasdaq.isBefore(oneAndHalfMonthsAgo)) {

			// 2달 이상인가?
			if (dateOfNasdaq.isBefore(twoMonthsAgo)) {
				// 트리거 해제
				return false;
			}
			List<Stock> dataAfterReferenceDate = stockRepository.findByTickerAndDateAfterOrderByDateAsc(largestCompany, dateOfNasdaq);

			// 8거래일 연속 상승
			return !isEightDaysUp(dataAfterReferenceDate);
		}
		return true;
	}

	private void saveStockData(List<StockInfoOutputRes> stockData, String ticker) {
		DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMdd");

		List<Stock> stocks = stockData.stream()
			.map(data -> Stock.builder().ticker(ticker).date(LocalDate.parse(data.stckBsopDate(), formatter)).price(Double.valueOf(data.ovrsNmixPrpr())).build())
			.collect(Collectors.toList());

		stockRepository.saveAll(stocks);
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

	private void saveNasdaqData(List<NasdaqOutput2Res> nasdaqData) {

		nasdaqData.sort(Comparator.comparing(NasdaqOutput2Res::stckBsopDate));

		List<Nasdaq> nasdaqs = new ArrayList<>();
		Double previousPrice = null;
		DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMdd");

		for (NasdaqOutput2Res data : nasdaqData) {
			LocalDate date = LocalDate.parse(data.stckBsopDate(), formatter);
			Double todayPrice = Double.valueOf(data.ovrsNmixPrpr());

			Double rate = null;
			if (previousPrice != null) {
				rate = ((todayPrice - previousPrice) / previousPrice) * 100.0;
			} else {
				rate = 0.0;
			}

			Nasdaq nasdaq = Nasdaq.builder().date(date).price(todayPrice).rate(rate).build();
			nasdaqs.add(nasdaq);

			previousPrice = todayPrice;
		}

		nasdaqRepository.saveAll(nasdaqs);
	}

	private Boolean isEightDaysUp(List<Stock> data) {
		// 8거래일 이상?
		if (data.size() < 8) {
			return false;
		}
		// startIndex = 0 ~ stocks.size() - 8
		for (int startIndex = 0; startIndex <= data.size() - 8; startIndex++) {
			boolean allUp = true;

			// startIndex+1 ~ startIndex+7까지 체크
			for (int i = startIndex + 1; i < startIndex + 8; i++) {
				double prevPrice = data.get(i - 1).getPrice();
				double currPrice = data.get(i).getPrice();
				if (currPrice <= prevPrice) {
					allUp = false;
					break;
				}
			}
			if (allUp) {
				return true;
			}
		}
		return false;
	}

	private void stockOrder(String ticker, Integer quantity, Double price, String orderType) {
		// 매수, 매도 코드
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

	public NasdaqDataRes outputNasdaqData() {
		HttpHeaders httpheaders = tokenUtils.createAuthorizationBody("FHKST03030100");
		String URL = "https://openapi.koreainvestment.com:9443/uapi/overseas-price/v1/quotations/inquire-daily-chartprice";

		DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMdd");
		LocalDate today = LocalDate.now();
		String formattedToday = today.format(formatter);

		Map<String, String> parameters = new HashMap<>();
		parameters.put("FID_COND_MRKT_DIV_CODE", "N");
		parameters.put("FID_INPUT_ISCD", "COMP");
		parameters.put("FID_INPUT_DATE_1", "20230101");
		parameters.put("FID_INPUT_DATE_2", formattedToday);
		parameters.put("FID_PERIOD_DIV_CODE", "D");

		ResponseEntity<NasdaqDataRes> response = apiUtils.getRequest(httpheaders, URL, parameters, NasdaqDataRes.class);

		log.info("Response body: {}", response.getBody());

		return response.getBody();
	}
}