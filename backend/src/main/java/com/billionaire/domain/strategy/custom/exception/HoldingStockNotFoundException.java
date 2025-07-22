package com.billionaire.domain.strategy.custom.exception;

import com.billionaire.global.exception.BusinessException;
import com.billionaire.global.exception.ErrorCode;

public class HoldingStockNotFoundException extends BusinessException {
	
	public HoldingStockNotFoundException() {
		super(ErrorCode.HOLDING_STOCK_NOT_FOUND);
	}
}