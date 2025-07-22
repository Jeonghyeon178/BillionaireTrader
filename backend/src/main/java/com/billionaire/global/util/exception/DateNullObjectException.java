package com.billionaire.global.util.exception;

import com.billionaire.global.exception.BusinessException;
import com.billionaire.global.exception.ErrorCode;

public class DateNullObjectException extends BusinessException {
	
	public DateNullObjectException() {
		super(ErrorCode.DATE_NULL_OBJECT);
	}
}