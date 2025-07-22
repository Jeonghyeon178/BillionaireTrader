package com.billionaire.global.util.exception;

import com.billionaire.global.exception.BusinessException;
import com.billionaire.global.exception.ErrorCode;

public class InvalidApiResponseTypeException extends BusinessException {
	
	public InvalidApiResponseTypeException() {
		super(ErrorCode.INVALID_API_RESPONSE_TYPE);
	}
}