package com.backend.domain.auto_trading.dto.response;

import java.util.List;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public record InquireNccsRes(List<InquireNccsOutputRes> output) {
}
