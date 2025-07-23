package com.billionaire.domain.listing.exception;

import com.billionaire.global.exception.BusinessException;
import com.billionaire.global.exception.ErrorCode;

public class ListingSaveFailedException extends BusinessException {
	public ListingSaveFailedException() {
		super(ErrorCode.LISTING_SAVE_FAILED);
	}
}
