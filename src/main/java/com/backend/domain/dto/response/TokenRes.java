package com.backend.domain.dto.response;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public record TokenRes(String accessToken, String accessTokenTokenExpired, String TokenType, Integer expiresIn) {
}
