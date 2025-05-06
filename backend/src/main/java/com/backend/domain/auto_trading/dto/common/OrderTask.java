package com.backend.domain.auto_trading.dto.common;

public record OrderTask(String ticker, Integer quantity, Double price, String orderType) {
}
