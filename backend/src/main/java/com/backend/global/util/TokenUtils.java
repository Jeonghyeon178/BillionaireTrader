package com.backend.global.util;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;

import com.backend.domain.account.entity.Token;
import com.backend.domain.token.repository.TokenRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class TokenUtils {

	@Value("${ks.app-key}")
	private String APP_KEY;
	@Value("${ks.app-secret}")
	private String APP_SECRET;

	private final TokenRepository tokenRepository;

	public Optional<Token> getLatestToken() {
		return tokenRepository.findTopByOrderByIdDesc();
	}

	public HttpHeaders createAuthorizationBody(String trId) {
		Optional<Token> token = getLatestToken();
		HttpHeaders headers = new HttpHeaders();
		token.ifPresent(t -> headers.set("authorization", "Bearer " + t.getAccessToken()));
		headers.set("appkey", APP_KEY);
		headers.set("appsecret", APP_SECRET);
		headers.set("tr_id", trId);
		headers.setContentType(MediaType.APPLICATION_JSON);
		return headers;
	}

	public HttpHeaders createAuthorizationBody(String trId, String clientType) {
		Optional<Token> token = getLatestToken();
		HttpHeaders headers = new HttpHeaders();
		token.ifPresent(t -> headers.set("authorization", "Bearer " + t.getAccessToken()));
		headers.set("appkey", APP_KEY);
		headers.set("appsecret", APP_SECRET);
		headers.set("tr_id", trId);
		headers.set("custtype", clientType);
		headers.setContentType(MediaType.APPLICATION_JSON);
		return headers;
	}
}
