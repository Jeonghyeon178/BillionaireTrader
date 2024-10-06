package com.backend.domain.dto.mapper;

import org.springframework.stereotype.Component;

import com.backend.domain.dto.response.TokenRes;
import com.backend.domain.entity.Token;

@Component
public class TokenMapper {

	public Token toToken(TokenRes tokenRes) {
		return Token.builder()
			.accessToken(tokenRes.accessToken())
			.expiration(tokenRes.accessTokenTokenExpired())
			.build();
	}
}
