package com.billionaire.domain.strategy.custom.exception;

import com.billionaire.global.exception.BusinessException;
import com.billionaire.global.exception.ErrorCode;

public class HighestPriceNotFoundException extends BusinessException {
	
	public HighestPriceNotFoundException() {
		super(ErrorCode.HIGHEST_PRICE_NOT_FOUND);
	}
}