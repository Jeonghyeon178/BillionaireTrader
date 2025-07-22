package com.billionaire.global.util.exception;

import com.billionaire.global.exception.BusinessException;
import com.billionaire.global.exception.ErrorCode;

public class TokenInvalidAccessTokenException extends BusinessException {
	
	public TokenInvalidAccessTokenException() {
		super(ErrorCode.TOKEN_INVALID_ACCESS_TOKEN);
	}
}