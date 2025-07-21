package com.billionaire.domain.index.exception;

import com.billionaire.global.exception.BusinessException;
import com.billionaire.global.exception.ErrorCode;

public class IndexDataNotFoundException extends BusinessException {
	
	public IndexDataNotFoundException() {
		super(ErrorCode.INDEX_NOT_FOUND);
	}
}