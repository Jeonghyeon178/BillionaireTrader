package com.billionaire.global.dto;

import org.springframework.http.HttpStatus;

import com.billionaire.global.exception.ErrorCode;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ErrorResponse {
	
	@NotNull(message = "HTTP 상태는 필수입니다")
	private final HttpStatus httpStatus;
	@NotBlank(message = "에러 코드는 필수입니다")
	private final String code;
	@NotBlank(message = "에러 메시지는 필수입니다")
	private final String errorMessage;
	
	public static ErrorResponse of(ErrorCode errorCode) {
		return new ErrorResponse(errorCode.getStatus(), errorCode.getCode(), errorCode.getMessage());
	}
	
	public static ErrorResponse of(HttpStatus httpStatus, String message) {
		return new ErrorResponse(httpStatus, "UNKNOWN", message);
	}
}