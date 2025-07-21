package com.billionaire.domain.strategy.custom.exception;

import com.billionaire.global.exception.BusinessException;
import com.billionaire.global.exception.ErrorCode;

public class LowestPriceNotFoundException extends BusinessException {
	
	public LowestPriceNotFoundException(String ticker) {
		super(ErrorCode.LOWEST_PRICE_NOT_FOUND, ticker + "의 최저가 데이터를 찾을 수 없습니다.");
	}
}