package com.billionaire.global.util.exception;

import com.billionaire.global.exception.BusinessException;
import com.billionaire.global.exception.ErrorCode;

public class DateNullOrEmptyException extends BusinessException {
	
	public DateNullOrEmptyException() {
		super(ErrorCode.DATE_NULL_OR_EMPTY);
	}
}