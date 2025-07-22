package com.billionaire.global.util;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;

import com.billionaire.global.util.exception.DateNullOrEmptyException;
import com.billionaire.global.util.exception.DateInvalidLengthException;
import com.billionaire.global.util.exception.DateInvalidFormatException;
import com.billionaire.global.util.exception.DateNullObjectException;

public class DateUtils {
	private DateUtils() {
		throw new AssertionError("유틸리티 클래스 - 인스턴스화하지 마십시오");
	}

	// yyyyMMdd 포맷을 위한 상수 포매터
	public static final DateTimeFormatter YYYYMMDD_FORMATTER = DateTimeFormatter.ofPattern("yyyyMMdd");

	// 현재 날짜를 yyyyMMdd 형식의 문자열로 반환
	public static String nowInYYYYMMDD() {
		return LocalDate.now().format(YYYYMMDD_FORMATTER);
	}

	// 특정 LocalDate를 yyyyMMdd 형식으로 포맷
	public static String format(LocalDate date) {
		if (date == null) {
			throw new DateNullObjectException();
		}
		try {
			return date.format(YYYYMMDD_FORMATTER);
		} catch (Exception e) {
			throw new DateInvalidFormatException();
		}
	}

	// yyyyMMdd 문자열을 LocalDate로 파싱
	public static LocalDate parse(String yyyyMMdd) {
		if (yyyyMMdd == null || yyyyMMdd.trim().isEmpty()) {
			throw new DateNullOrEmptyException();
		}
		if (yyyyMMdd.length() != 8) {
			throw new DateInvalidLengthException();
		}
		try {
			return LocalDate.parse(yyyyMMdd, YYYYMMDD_FORMATTER);
		} catch (DateTimeParseException e) {
			throw new DateInvalidFormatException();
		}
	}
}
