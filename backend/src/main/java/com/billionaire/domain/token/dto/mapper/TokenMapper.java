package com.billionaire.domain.token.dto.mapper;

import org.springframework.stereotype.Component;

import com.billionaire.domain.account.dto.response.TokenRes;
import com.billionaire.domain.account.entity.Token;

@Component
public class TokenMapper {

	public Token toToken(TokenRes tokenRes) {
		return Token.builder()
			.accessToken(tokenRes.accessToken())
			.expiration(tokenRes.accessTokenTokenExpired())
			.build();
	}
}
