package com.billionaire.domain.stock.exception;

import com.billionaire.global.exception.BusinessException;
import com.billionaire.global.exception.ErrorCode;

public class ListingFileParsingException extends BusinessException {
	public ListingFileParsingException(String filePath, Throwable cause) {
		super(ErrorCode.LISTING_FILE_PARSING_FAILED, cause, "파일 경로: " + filePath);
	}
}
