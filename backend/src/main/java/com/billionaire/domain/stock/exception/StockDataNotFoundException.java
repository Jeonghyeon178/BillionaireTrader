package com.billionaire.domain.stock.exception;

import com.billionaire.global.exception.BusinessException;
import com.billionaire.global.exception.ErrorCode;

public class StockDataNotFoundException extends BusinessException {
	
	public StockDataNotFoundException() {
		super(ErrorCode.STOCK_DATA_NOT_FOUND);
	}
}