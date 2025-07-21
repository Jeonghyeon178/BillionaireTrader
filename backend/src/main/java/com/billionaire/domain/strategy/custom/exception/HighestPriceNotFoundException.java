package com.billionaire.domain.strategy.custom.exception;

import com.billionaire.global.exception.BusinessException;
import com.billionaire.global.exception.ErrorCode;

public class HighestPriceNotFoundException extends BusinessException {
	
	public HighestPriceNotFoundException(String ticker) {
		super(ErrorCode.HIGHEST_PRICE_NOT_FOUND, ticker + "의 최고가 데이터를 찾을 수 없습니다.");
	}
}