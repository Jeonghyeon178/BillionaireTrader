package com.backend.domain.auto_trading.dto.response;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public record NasdaqInfoOutputRes(
	String prdyCtrt
) {
}
