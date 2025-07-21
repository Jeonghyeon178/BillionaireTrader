package com.billionaire.global.dto;

import org.springframework.http.HttpStatus;

import com.billionaire.global.exception.ErrorCode;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ErrorResponse {
	
	private final HttpStatus httpStatus;
	private final String code;
	private final String errorMessage;
	
	public static ErrorResponse of(ErrorCode errorCode) {
		return new ErrorResponse(errorCode.getStatus(), errorCode.getCode(), errorCode.getMessage());
	}
	
	public static ErrorResponse of(HttpStatus httpStatus, String message) {
		return new ErrorResponse(httpStatus, "UNKNOWN", message);
	}
}