package com.billionaire.global.constants;

public final class TradingConstants {

	private TradingConstants() {
		// 유틸리티 클래스 - 인스턴스화 방지
	}

	/**
	 * 리밸런싱 관련 상수
	 */
	public static final class Rebalancing {
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
	 * 검증 관련 상수
	 */
	public static final class Validation {
		// 최소 거래 금액 (0.01원)
		public static final double MIN_TRADE_AMOUNT = 0.01;

		// 기본 최대 거래 금액 (1억원)
		public static final double DEFAULT_MAX_TRADE_AMOUNT = 100_000_000.0;

		// 주문 최대 거래 금액 (5천만원)
		public static final double ORDER_MAX_TRADE_AMOUNT = 50_000_000.0;
	}

	/**
	 * API 호출 관련 상수
	 */
	public static final class ApiCall {
		// API 호출 간격 (100ms)
		public static final long CALL_INTERVAL_MS = 100L;

		// 기본 대기 시간 (0.1초)
		public static final double DEFAULT_WAIT_SECONDS = 0.1;
	}

	/**
	 * 계산 관련 상수
	 */
	public static final class Calculation {
		// 퍼센트 계산용 (100.0)
		public static final double PERCENT_MULTIPLIER = 100.0;

		// 소수점 반올림용 (100.0)
		public static final double ROUNDING_MULTIPLIER = 100.0;

		// 초기값 (0.0)
		public static final double ZERO = 0.0;
	}
}