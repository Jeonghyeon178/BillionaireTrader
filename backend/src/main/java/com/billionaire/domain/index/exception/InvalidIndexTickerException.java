package com.billionaire.domain.index.exception;

import com.billionaire.global.exception.BusinessException;
import com.billionaire.global.exception.ErrorCode;

public class InvalidIndexTickerException extends BusinessException {
	
	public InvalidIndexTickerException() {
		super(ErrorCode.INVALID_INDEX_TICKER);
	}
}