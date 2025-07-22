package com.billionaire.global.util.exception;

import com.billionaire.global.exception.BusinessException;
import com.billionaire.global.exception.ErrorCode;

public class ApiRequestFailedException extends BusinessException {
	
	public ApiRequestFailedException() {
		super(ErrorCode.API_REQUEST_FAILED);
	}
}