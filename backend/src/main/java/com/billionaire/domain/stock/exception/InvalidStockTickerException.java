package com.billionaire.domain.stock.exception;

import com.billionaire.global.exception.BusinessException;
import com.billionaire.global.exception.ErrorCode;

public class InvalidStockTickerException extends BusinessException {
	
	public InvalidStockTickerException() {
		super(ErrorCode.INVALID_STOCK_TICKER);
	}
}