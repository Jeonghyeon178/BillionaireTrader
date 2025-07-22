package com.billionaire.global.util.exception;

import com.billionaire.global.exception.BusinessException;
import com.billionaire.global.exception.ErrorCode;

public class DateInvalidFormatException extends BusinessException {
	
	public DateInvalidFormatException() {
		super(ErrorCode.DATE_INVALID_FORMAT);
	}
}