package com.billionaire.domain.index.exception;

import com.billionaire.global.exception.BusinessException;
import com.billionaire.global.exception.ErrorCode;

public class UnknownMarketIndexException extends BusinessException {
	
	public UnknownMarketIndexException() {
		super(ErrorCode.INVALID_INDEX_TICKER);
	}
}