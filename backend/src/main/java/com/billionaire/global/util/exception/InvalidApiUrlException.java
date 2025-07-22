package com.billionaire.global.util.exception;

import com.billionaire.global.exception.BusinessException;
import com.billionaire.global.exception.ErrorCode;

public class InvalidApiUrlException extends BusinessException {
	
	public InvalidApiUrlException() {
		super(ErrorCode.INVALID_API_URL);
	}
}