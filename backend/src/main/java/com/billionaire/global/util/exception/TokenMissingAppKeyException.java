package com.billionaire.global.util.exception;

import com.billionaire.global.exception.BusinessException;
import com.billionaire.global.exception.ErrorCode;

public class TokenMissingAppKeyException extends BusinessException {
	
	public TokenMissingAppKeyException() {
		super(ErrorCode.TOKEN_MISSING_APP_KEY);
	}
}