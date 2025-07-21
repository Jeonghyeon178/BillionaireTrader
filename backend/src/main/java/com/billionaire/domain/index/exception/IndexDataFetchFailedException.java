package com.billionaire.domain.index.exception;

import com.billionaire.global.exception.BusinessException;
import com.billionaire.global.exception.ErrorCode;

public class IndexDataFetchFailedException extends BusinessException {
	
	public IndexDataFetchFailedException() {
		super(ErrorCode.INDEX_DATA_FETCH_FAILED);
	}
}