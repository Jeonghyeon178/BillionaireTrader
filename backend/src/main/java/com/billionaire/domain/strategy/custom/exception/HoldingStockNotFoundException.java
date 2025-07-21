package com.billionaire.domain.strategy.custom.exception;

import com.billionaire.global.exception.BusinessException;
import com.billionaire.global.exception.ErrorCode;

public class HoldingStockNotFoundException extends BusinessException {
	
	public HoldingStockNotFoundException(String ticker) {
		super(ErrorCode.HOLDING_STOCK_NOT_FOUND, ticker + "의 보유 주식 정보를 찾을 수 없습니다.");
	}
}