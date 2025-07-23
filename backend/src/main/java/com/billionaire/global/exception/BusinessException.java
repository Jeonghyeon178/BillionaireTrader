package com.billionaire.global.exception;

import lombok.Getter;

@Getter
public class BusinessException extends RuntimeException {
	
	private final ErrorCode errorCode;
	
	public BusinessException(ErrorCode errorCode) {
		super(errorCode.getMessage());
		this.errorCode = errorCode;
	}

	public BusinessException(ErrorCode errorCode, String extraMessage) {
		super(String.format("%s - %s", errorCode.getMessage(), extraMessage));
		this.errorCode = errorCode;
	}

	public BusinessException(ErrorCode errorCode, Throwable cause) {
		super(errorCode.getMessage(), cause);
		this.errorCode = errorCode;
	}

	public BusinessException(ErrorCode errorCode, Throwable cause, String extraMessage) {
		super(String.format("%s - %s", errorCode.getMessage(), extraMessage), cause);
		this.errorCode = errorCode;
	}
}