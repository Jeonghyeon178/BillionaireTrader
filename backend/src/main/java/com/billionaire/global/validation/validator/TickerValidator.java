package com.billionaire.global.validation.validator;

import com.billionaire.global.validation.annotation.ValidTicker;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import java.util.regex.Pattern;

/**
 * 주식 종목 코드 유효성 검증기
 * 
 * 검증 규칙:
 * - 영문 대문자와 숫자만 허용 (A-Z, 0-9)
 * - 1~10자 길이
 * - null이나 빈 문자열은 다른 어노테이션(@NotBlank)에서 처리
 */
public class TickerValidator implements ConstraintValidator<ValidTicker, String> {
    
    // 영문 대문자와 숫자만 허용하는 정규식 패턴
    private static final Pattern TICKER_PATTERN = Pattern.compile("^[A-Z0-9]{1,10}$");
    
    @Override
    public void initialize(ValidTicker constraintAnnotation) {
        // 초기화 로직이 필요한 경우 여기에 구현
    }
    
    @Override
    public boolean isValid(String ticker, ConstraintValidatorContext context) {
        // null이나 빈 문자열은 유효한 것으로 간주 (다른 어노테이션에서 처리)
        if (ticker == null || ticker.trim().isEmpty()) {
            return true;
        }
        
        return TICKER_PATTERN.matcher(ticker.trim()).matches();
    }
}