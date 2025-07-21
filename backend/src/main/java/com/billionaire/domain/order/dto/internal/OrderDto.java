package com.billionaire.domain.order.dto.internal;

import com.billionaire.domain.order.type.OrderType;

import lombok.Builder;

@Builder
public record OrderDto(
    String ticker, 
    Integer quantity,
    Double price,
    OrderType orderType
) {}
