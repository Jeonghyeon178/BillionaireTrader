package com.billionaire.global.validation.annotation;

import com.billionaire.global.validation.validator.TickerValidator;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * 유효한 주식 종목 코드인지 검증하는 어노테이션
 * 
 * 주식 종목 코드는 다음 규칙을 따라야 합니다:
 * - 영문 대문자와 숫자만 허용
 * - 1~10자 길이
 * - 특수문자 및 공백 불허
 */
@Documented
@Constraint(validatedBy = TickerValidator.class)
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidTicker {
    
    String message() default "{validation.ticker.invalid}";
    
    Class<?>[] groups() default {};
    
    Class<? extends Payload>[] payload() default {};
}