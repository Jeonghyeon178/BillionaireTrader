package com.billionaire.global.validation.annotation;

import com.billionaire.global.constants.TradingConstants;
import com.billionaire.global.validation.validator.TradeAmountValidator;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * 유효한 거래 금액인지 검증하는 어노테이션
 * 
 * 거래 금액은 다음 규칙을 따라야 합니다:
 * - 0보다 큰 양수
 * - 소수점 둘째 자리까지만 허용
 * - 최대 거래 금액 제한 (1억원)
 */
@Documented
@Constraint(validatedBy = TradeAmountValidator.class)
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidTradeAmount {
    
    String message() default "{validation.tradeAmount.invalid}";
    
    Class<?>[] groups() default {};
    
    Class<? extends Payload>[] payload() default {};
    
    /**
     * 최대 허용 거래 금액 (기본값: 100,000,000원)
     */
    double maxAmount() default TradingConstants.Validation.DEFAULT_MAX_TRADE_AMOUNT;
    
    /**
     * 최소 허용 거래 금액 (기본값: 0.01원)
     */
    double minAmount() default TradingConstants.Validation.MIN_TRADE_AMOUNT;
}