package com.billionaire.domain.token.exception;

import com.billionaire.global.exception.BusinessException;
import com.billionaire.global.exception.ErrorCode;

public class TokenNotFoundException extends BusinessException {
	
	public TokenNotFoundException() {
		super(ErrorCode.TOKEN_NOT_FOUND);
	}
}