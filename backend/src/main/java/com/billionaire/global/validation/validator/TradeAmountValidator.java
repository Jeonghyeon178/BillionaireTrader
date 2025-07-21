package com.billionaire.global.validation.validator;

import com.billionaire.global.validation.annotation.ValidTradeAmount;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * 거래 금액 유효성 검증기
 * 
 * 검증 규칙:
 * - 양수여야 함
 * - 소수점 둘째 자리까지만 허용
 * - 설정된 최소/최대 금액 범위 내
 */
public class TradeAmountValidator implements ConstraintValidator<ValidTradeAmount, Double> {
    
    private double maxAmount;
    private double minAmount;
    
    @Override
    public void initialize(ValidTradeAmount constraintAnnotation) {
        this.maxAmount = constraintAnnotation.maxAmount();
        this.minAmount = constraintAnnotation.minAmount();
    }
    
    @Override
    public boolean isValid(Double amount, ConstraintValidatorContext context) {
        // null은 다른 어노테이션에서 처리
        if (amount == null) {
            return true;
        }
        
        // 양수 검증
        if (amount <= 0) {
            addConstraintViolation(context, "거래 금액은 0보다 커야 합니다");
            return false;
        }
        
        // 범위 검증
        if (amount < minAmount || amount > maxAmount) {
            addConstraintViolation(context, 
                String.format("거래 금액은 %.2f원 이상 %.0f원 이하여야 합니다", minAmount, maxAmount));
            return false;
        }
        
        // 소수점 둘째 자리 검증
        BigDecimal bd = BigDecimal.valueOf(amount);
        if (bd.scale() > 2) {
            // 소수점 둘째 자리로 반올림했을 때 원래 값과 같은지 확인
            BigDecimal rounded = bd.setScale(2, RoundingMode.HALF_UP);
            if (rounded.doubleValue() != amount) {
                addConstraintViolation(context, "거래 금액은 소수점 둘째 자리까지만 허용됩니다");
                return false;
            }
        }
        
        return true;
    }
    
    private void addConstraintViolation(ConstraintValidatorContext context, String message) {
        context.disableDefaultConstraintViolation();
        context.buildConstraintViolationWithTemplate(message)
               .addConstraintViolation();
    }
}