package com.billionaire.global.util;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;

import com.billionaire.domain.token.entity.Token;
import com.billionaire.domain.token.repository.TokenRepository;
import com.billionaire.domain.token.service.TokenService;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class TokenUtils {

	@Value("${ks.app-key}")
	private String appKey;

	@Value("${ks.app-secret}")
	private String appSecret;

	private final TokenService tokenService;
	private final TokenRepository tokenRepository;

	public Optional<Token> getLatestToken() {
		return tokenRepository.findTopByOrderByIdDesc();
	}

	public HttpHeaders createAuthorizationHeaders(String trId) {
		return createAuthorizationHeaders(trId, null);
	}

	public HttpHeaders createAuthorizationHeaders(String trId, String clientType) {
		tokenService.validateOrRefreshToken();

		Optional<Token> tokenOpt = getLatestToken();
		HttpHeaders headers = new HttpHeaders();

		tokenOpt.ifPresent(token -> headers.set("authorization", "Bearer " + token.getAccessToken()));
		headers.set("appkey", appKey);
		headers.set("appsecret", appSecret);
		headers.set("tr_id", trId);
		if (clientType != null && !clientType.isBlank()) {
			headers.set("custtype", clientType);
		}
		headers.setContentType(MediaType.APPLICATION_JSON);
		return headers;
	}
}
