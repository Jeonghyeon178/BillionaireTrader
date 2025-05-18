package com.billionaire.domain.order.model;

import com.billionaire.domain.order.type.OrderType;

import lombok.Builder;

@Builder
public record Order(String ticker, Integer quantity, Double price, OrderType orderType) {
}
