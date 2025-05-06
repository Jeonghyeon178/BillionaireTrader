package com.backend.domain.auto_trading.dto.response;

import lombok.Builder;

@Builder
public record IndicesRes(String name, Float rate, Float value) {
}
