package com.billionaire.global.exception;

import org.springframework.http.HttpStatus;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum ErrorCode {

	// Global
	VALIDATION_ERROR(HttpStatus.BAD_REQUEST, "G001", "입력값 검증에 실패했습니다."),

	// Account
	ACCOUNT_NOT_FOUND(HttpStatus.NOT_FOUND, "A001", "계좌를 찾을 수 없습니다."),

	// Stock
	STOCK_NOT_FOUND(HttpStatus.NOT_FOUND, "S001", "주식 정보를 찾을 수 없습니다."),
	STOCK_PRICE_FETCH_FAILED(HttpStatus.INTERNAL_SERVER_ERROR, "S002", "주식 가격 조회에 실패했습니다."),
	STOCK_DATA_FETCH_FAILED(HttpStatus.INTERNAL_SERVER_ERROR, "S003", "주식 데이터 조회에 실패했습니다."),
	STOCK_DATA_NOT_FOUND(HttpStatus.NOT_FOUND, "S004", "주식 데이터를 찾을 수 없습니다."),
	INVALID_STOCK_TICKER(HttpStatus.BAD_REQUEST, "S005", "유효하지 않은 주식 티커입니다."),

	// Index
	INDEX_NOT_FOUND(HttpStatus.NOT_FOUND, "I001", "인덱스 정보를 찾을 수 없습니다."),
	INDEX_DATA_FETCH_FAILED(HttpStatus.INTERNAL_SERVER_ERROR, "I002", "인덱스 데이터 조회에 실패했습니다."),
	INVALID_INDEX_TICKER(HttpStatus.BAD_REQUEST, "I003", "유효하지 않은 인덱스 티커입니다."),
	INDEX_DATA_NOT_FOUND(HttpStatus.NOT_FOUND, "I004", "인덱스 데이터를 찾을 수 없습니다."),

	// OrderDto
	ORDER_NOT_FOUND(HttpStatus.NOT_FOUND, "O001", "주문을 찾을 수 없습니다."),
	INVALID_ORDER_TYPE(HttpStatus.BAD_REQUEST, "O002", "유효하지 않은 주문 타입입니다."),
	ORDER_EXECUTION_FAILED(HttpStatus.INTERNAL_SERVER_ERROR, "O003", "주문 실행에 실패했습니다."),
	INVALID_ORDER_QUANTITY(HttpStatus.BAD_REQUEST, "O004", "유효하지 않은 주문 수량입니다."),
	ORDER_ALREADY_CANCELLED(HttpStatus.BAD_REQUEST, "O005", "이미 취소된 주문입니다."),

	// Token
	TOKEN_NOT_FOUND(HttpStatus.NOT_FOUND, "T001", "토큰을 찾을 수 없습니다."),
	TOKEN_CREATION_FAILED(HttpStatus.INTERNAL_SERVER_ERROR, "T002", "토큰 생성에 실패했습니다."),

	// Strategy
	STRATEGY_NOT_FOUND(HttpStatus.NOT_FOUND, "ST001", "전략을 찾을 수 없습니다."),
	REBALANCE_FAILED(HttpStatus.INTERNAL_SERVER_ERROR, "ST002", "리밸런싱에 실패했습니다."),
	INVALID_STRATEGY_CONFIGURATION(HttpStatus.BAD_REQUEST, "ST003", "유효하지 않은 전략 설정입니다."),
	HIGHEST_PRICE_NOT_FOUND(HttpStatus.NOT_FOUND, "ST004", "최고가 데이터를 찾을 수 없습니다."),
	LOWEST_PRICE_NOT_FOUND(HttpStatus.NOT_FOUND, "ST005", "최저가 데이터를 찾을 수 없습니다."),
	HOLDING_STOCK_NOT_FOUND(HttpStatus.NOT_FOUND, "ST006", "보유 주식 정보를 찾을 수 없습니다."),

	// External API
	EXTERNAL_API_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "E001", "외부 API 호출에 실패했습니다."),
	API_RATE_LIMIT_EXCEEDED(HttpStatus.TOO_MANY_REQUESTS, "E002", "API 호출 한도를 초과했습니다."),
	API_AUTHENTICATION_FAILED(HttpStatus.UNAUTHORIZED, "E003", "API 인증에 실패했습니다.");

	private final HttpStatus status;
	private final String code;
	private final String message;
}