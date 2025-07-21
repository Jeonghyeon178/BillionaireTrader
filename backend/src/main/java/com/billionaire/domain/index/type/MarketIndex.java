package com.billionaire.domain.index.type;

import com.billionaire.domain.index.exception.UnknownMarketIndexException;

import lombok.Getter;

@Getter
public enum MarketIndex {
	NASDAQ("COMP", "N"),
	DOW_JONES(".DJI", "N"),
	SNP500("SPX", "N"),
	USD_KRW("FX@KRW", "X");

	private final String ticker;
	private final String market;

	MarketIndex(String ticker, String market) {
		this.ticker = ticker;
		this.market = market;
	}

	public static MarketIndex fromPath(String path) {
		return switch (path.toLowerCase()) {
			case "nasdaq" -> NASDAQ;
			case "dow-jones" -> DOW_JONES;
			case "snp500" -> SNP500;
			case "usd-krw" -> USD_KRW;
			default -> throw new UnknownMarketIndexException();
		};
	}
}
