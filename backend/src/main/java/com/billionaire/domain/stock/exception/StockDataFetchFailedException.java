package com.billionaire.domain.stock.exception;

import com.billionaire.global.exception.BusinessException;
import com.billionaire.global.exception.ErrorCode;

public class StockDataFetchFailedException extends BusinessException {
	
	public StockDataFetchFailedException() {
		super(ErrorCode.STOCK_DATA_FETCH_FAILED);
	}
}