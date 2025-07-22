package com.billionaire.domain.strategy.custom.exception;

import com.billionaire.global.exception.BusinessException;
import com.billionaire.global.exception.ErrorCode;

public class LowestPriceNotFoundException extends BusinessException {
	
	public LowestPriceNotFoundException() {
		super(ErrorCode.LOWEST_PRICE_NOT_FOUND);
	}
}