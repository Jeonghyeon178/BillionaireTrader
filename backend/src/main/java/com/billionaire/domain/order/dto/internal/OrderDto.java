package com.billionaire.domain.order.dto.internal;

import com.billionaire.domain.order.type.OrderType;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;

@Builder
public record OrderDto(
    @NotBlank(message = "종목 코드는 필수입니다")
    String ticker,
    @NotNull(message = "수량은 필수입니다")
    @Min(value = 1, message = "수량은 1 이상이어야 합니다")
    Integer quantity,
    @NotNull(message = "가격은 필수입니다")
    @DecimalMin(value = "0.0", inclusive = false, message = "가격은 0보다 커야 합니다")
    Double price,
    @NotNull(message = "주문 타입은 필수입니다")
    OrderType orderType
) {}
