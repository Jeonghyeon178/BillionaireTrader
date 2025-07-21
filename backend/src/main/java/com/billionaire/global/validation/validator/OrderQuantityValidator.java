package com.billionaire.global.validation.validator;

import com.billionaire.global.validation.annotation.ValidOrderQuantity;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

/**
 * 주문 수량 유효성 검증기
 * 
 * 검증 규칙:
 * - 양의 정수여야 함
 * - 설정된 최소/최대 수량 범위 내
 * - 소수 단위 허용 여부에 따른 검증
 */
public class OrderQuantityValidator implements ConstraintValidator<ValidOrderQuantity, Integer> {
    
    private int maxQuantity;
    private int minQuantity;
    private boolean allowFractional;
    
    @Override
    public void initialize(ValidOrderQuantity constraintAnnotation) {
        this.maxQuantity = constraintAnnotation.maxQuantity();
        this.minQuantity = constraintAnnotation.minQuantity();
        this.allowFractional = constraintAnnotation.allowFractional();
    }
    
    @Override
    public boolean isValid(Integer quantity, ConstraintValidatorContext context) {
        // null은 다른 어노테이션에서 처리
        if (quantity == null) {
            return true;
        }
        
        // 양수 검증
        if (quantity <= 0) {
            addConstraintViolation(context, "주문 수량은 0보다 커야 합니다");
            return false;
        }
        
        // 범위 검증
        if (quantity < minQuantity || quantity > maxQuantity) {
            addConstraintViolation(context, 
                String.format("주문 수량은 %d주 이상 %d주 이하여야 합니다", minQuantity, maxQuantity));
            return false;
        }
        
        // 비즈니스 규칙 검증
        if (!isValidBusinessRule(quantity, context)) {
            return false;
        }
        
        return true;
    }
    
    /**
     * 비즈니스 규칙 검증
     * - 대량 주문에 대한 경고
     * - 시장별 특별 규칙 등
     */
    private boolean isValidBusinessRule(Integer quantity, ConstraintValidatorContext context) {
        // 대량 주문 검증 (10,000주 이상)
        if (quantity >= 10_000) {
            // 경고성 메시지이므로 검증은 통과하되 로그 남김
            // 실제 환경에서는 로깅 프레임워크 사용
            System.out.println("대량 주문이 감지되었습니다: " + quantity + "주");
        }
        
        // 홀수 단위 주문 체크 (일부 시장에서는 짝수 단위만 허용)
        // 현재는 모든 단위 허용
        
        return true;
    }
    
    private void addConstraintViolation(ConstraintValidatorContext context, String message) {
        context.disableDefaultConstraintViolation();
        context.buildConstraintViolationWithTemplate(message)
               .addConstraintViolation();
    }
}