package com.billionaire.global.util.exception;

import com.billionaire.global.exception.BusinessException;
import com.billionaire.global.exception.ErrorCode;

public class ExternalApiErrorException extends BusinessException {
	
	public ExternalApiErrorException() {
		super(ErrorCode.EXTERNAL_API_ERROR);
	}
}