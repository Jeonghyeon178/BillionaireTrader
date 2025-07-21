package com.billionaire.domain.token.exception;

import com.billionaire.global.exception.BusinessException;
import com.billionaire.global.exception.ErrorCode;

public class TokenCreationFailedException extends BusinessException {
	
	public TokenCreationFailedException() {
		super(ErrorCode.TOKEN_CREATION_FAILED);
	}
}