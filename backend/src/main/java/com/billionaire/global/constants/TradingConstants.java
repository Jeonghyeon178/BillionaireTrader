package com.billionaire.global.constants;

public final class TradingConstants {

	private TradingConstants() {
		// 유틸리티 클래스 - 인스턴스화 방지
	}

	/**
	 * 리밸런싱 관련 상수
	 */
	public static final class Rebalancing {
		private Rebalancing() {
			throw new AssertionError("Rebalancing을 인스턴스화 할 수 없습니다");
		}


		// 하락 구간 단위 (5%)
		public static final double DROP_UNIT_5_PERCENT = 0.05;

		// 상승 구간 단위 (2.5%)
		public static final double RISE_UNIT_2_5_PERCENT = 0.025;

		// 매수/매도 비율 (10%)
		public static final double TRADE_RATIO_10_PERCENT = 0.1;

		// 시가총액 비교 기준 (90%)
		public static final double MARKET_CAP_THRESHOLD = 0.9;
	}

	/**
	 * API 호출 관련 상수
	 */
	public static final class ApiCall {
		private ApiCall() {
			throw new AssertionError("Apicall을 인스턴스화 할 수 없습니다");
		}

		// API 호출 간격 (100ms)
		public static final long CALL_INTERVAL_MS = 100L;

		// 기본 대기 시간 (0.1초)
		public static final double DEFAULT_WAIT_SECONDS = 0.1;
	}

}