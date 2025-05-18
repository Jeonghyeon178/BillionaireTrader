package com.billionaire.domain.order.type;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum OrderType {
	BUY("TTTT1002U"),
	SELL("TTTT1006U");

	private final String apiCode;

	public String getApiCode() {
		return apiCode;
	}

}
