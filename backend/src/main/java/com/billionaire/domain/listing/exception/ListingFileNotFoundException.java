package com.billionaire.domain.listing.exception;

import com.billionaire.global.exception.BusinessException;
import com.billionaire.global.exception.ErrorCode;

public class ListingFileNotFoundException extends BusinessException {
	public ListingFileNotFoundException(String filePath) {
		super(ErrorCode.LISTING_FILE_NOT_FOUND, "파일 경로: " + filePath);
	}
}
