package com.billionaire.global.util.exception;

import com.billionaire.global.exception.BusinessException;
import com.billionaire.global.exception.ErrorCode;

public class TokenInvalidTransactionIdException extends BusinessException {
	
	public TokenInvalidTransactionIdException() {
		super(ErrorCode.TOKEN_INVALID_TRANSACTION_ID);
	}
}