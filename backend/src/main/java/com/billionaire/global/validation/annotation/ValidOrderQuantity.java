package com.billionaire.global.validation.annotation;

import com.billionaire.global.validation.validator.OrderQuantityValidator;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * 유효한 주문 수량인지 검증하는 어노테이션
 * 
 * 주문 수량은 다음 규칙을 따라야 합니다:
 * - 1 이상의 양의 정수
 * - 최대 주문 수량 제한
 * - 해외 주식의 경우 소수 단위 허용 가능
 */
@Documented
@Constraint(validatedBy = OrderQuantityValidator.class)
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidOrderQuantity {
    
    String message() default "{validation.orderQuantity.invalid}";
    
    Class<?>[] groups() default {};
    
    Class<? extends Payload>[] payload() default {};
    
    /**
     * 최대 허용 주문 수량 (기본값: 100,000주)
     */
    int maxQuantity() default 100_000;
    
    /**
     * 최소 허용 주문 수량 (기본값: 1주)
     */
    int minQuantity() default 1;
    
    /**
     * 소수 단위 허용 여부 (기본값: false - 국내 주식)
     */
    boolean allowFractional() default false;
}