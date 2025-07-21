package com.billionaire.domain.account.exception;

import com.billionaire.global.exception.BusinessException;
import com.billionaire.global.exception.ErrorCode;

public class AccountNotFoundException extends BusinessException {
	
	public AccountNotFoundException() {
		super(ErrorCode.ACCOUNT_NOT_FOUND);
	}
}