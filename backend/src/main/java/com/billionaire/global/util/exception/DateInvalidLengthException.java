package com.billionaire.global.util.exception;

import com.billionaire.global.exception.BusinessException;
import com.billionaire.global.exception.ErrorCode;

public class DateInvalidLengthException extends BusinessException {
	
	public DateInvalidLengthException() {
		super(ErrorCode.DATE_INVALID_LENGTH);
	}
}