package com.billionaire.global.util.exception;

import com.billionaire.global.exception.BusinessException;
import com.billionaire.global.exception.ErrorCode;

public class TokenRefreshFailedException extends BusinessException {
	
	public TokenRefreshFailedException() {
		super(ErrorCode.TOKEN_REFRESH_FAILED);
	}
}