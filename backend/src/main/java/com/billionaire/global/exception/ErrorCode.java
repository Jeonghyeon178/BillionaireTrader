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

	// Listing
	LISTING_FILE_NOT_FOUND(HttpStatus.NOT_FOUND, "L001", "상장 종목 데이터 파일을 찾을 수 없습니다."),
	LISTING_FILE_PARSING_FAILED(HttpStatus.INTERNAL_SERVER_ERROR, "L002", "상장 종목 JSON 파싱에 실패했습니다."),
	LISTING_SAVE_FAILED(HttpStatus.INTERNAL_SERVER_ERROR, "L003", "상장 종목 DB 저장에 실패했습니다."),

	// External API
	EXTERNAL_API_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "E001", "외부 API 호출에 실패했습니다."),
	API_RATE_LIMIT_EXCEEDED(HttpStatus.TOO_MANY_REQUESTS, "E002", "API 호출 한도를 초과했습니다."),
	API_AUTHENTICATION_FAILED(HttpStatus.UNAUTHORIZED, "E003", "API 인증에 실패했습니다."),
	API_REQUEST_FAILED(HttpStatus.INTERNAL_SERVER_ERROR, "E004", "API 요청이 실패했습니다."),
	INVALID_API_URL(HttpStatus.BAD_REQUEST, "E005", "유효하지 않은 API URL입니다."),
	INVALID_API_RESPONSE_TYPE(HttpStatus.BAD_REQUEST, "E006", "유효하지 않은 API 응답 타입입니다."),

	// Token Utils
	TOKEN_INVALID_ACCESS_TOKEN(HttpStatus.UNAUTHORIZED, "T003", "유효하지 않은 액세스 토큰입니다."),
	TOKEN_MISSING_APP_KEY(HttpStatus.INTERNAL_SERVER_ERROR, "T004", "App Key가 설정되지 않았습니다."),
	TOKEN_MISSING_APP_SECRET(HttpStatus.INTERNAL_SERVER_ERROR, "T005", "App Secret이 설정되지 않았습니다."),
	TOKEN_INVALID_TRANSACTION_ID(HttpStatus.BAD_REQUEST, "T006", "유효하지 않은 Transaction ID입니다."),
	TOKEN_REFRESH_FAILED(HttpStatus.INTERNAL_SERVER_ERROR, "T007", "토큰 갱신에 실패했습니다."),

	// Date Utils
	DATE_NULL_OR_EMPTY(HttpStatus.BAD_REQUEST, "D001", "날짜 문자열이 null이거나 비어있습니다."),
	DATE_INVALID_LENGTH(HttpStatus.BAD_REQUEST, "D002", "날짜 문자열의 길이가 올바르지 않습니다."),
	DATE_INVALID_FORMAT(HttpStatus.BAD_REQUEST, "D003", "유효하지 않은 날짜 형식입니다."),
	DATE_NULL_OBJECT(HttpStatus.BAD_REQUEST, "D004", "날짜 객체가 null입니다.");

	private final HttpStatus status;
	private final String code;
	private final String message;
}