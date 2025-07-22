package com.billionaire.global.util.exception;

import com.billionaire.global.exception.BusinessException;
import com.billionaire.global.exception.ErrorCode;

public class TokenMissingAppSecretException extends BusinessException {
	
	public TokenMissingAppSecretException() {
		super(ErrorCode.TOKEN_MISSING_APP_SECRET);
	}
}