package com.billionaire.global.util;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;

import com.billionaire.domain.token.entity.Token;
import com.billionaire.domain.token.repository.TokenRepository;
import com.billionaire.domain.token.service.TokenService;
import com.billionaire.global.util.exception.TokenInvalidAccessTokenException;
import com.billionaire.global.util.exception.TokenMissingAppKeyException;
import com.billionaire.global.util.exception.TokenMissingAppSecretException;
import com.billionaire.global.util.exception.TokenInvalidTransactionIdException;
import com.billionaire.global.util.exception.TokenRefreshFailedException;
import com.billionaire.domain.token.exception.TokenNotFoundException;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
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
		validateRequiredFields(trId);
		
		try {
			tokenService.validateOrRefreshToken();

			HttpHeaders headers = getHttpHeaders(trId, clientType);
			headers.setContentType(MediaType.APPLICATION_JSON);
			
			log.debug("인증 헤더 생성 완료 - trId: {}", trId);
			return headers;
			
		} catch (TokenInvalidAccessTokenException | TokenNotFoundException e) {
			throw e;
		} catch (Exception e) {
			log.error("인증 헤더 생성 실패 - trId: {}, 오류: {}", trId, e.getMessage());
			throw new TokenRefreshFailedException();
		}
	}

	private HttpHeaders getHttpHeaders(String trId, String clientType) {
		Optional<Token> tokenOpt = getLatestToken();
		HttpHeaders headers = new HttpHeaders();

		if (tokenOpt.isPresent()) {
			Token token = tokenOpt.get();
			if (token.getAccessToken() == null || token.getAccessToken().isBlank()) {
				throw new TokenInvalidAccessTokenException();
			}
			headers.set("authorization", "Bearer " + token.getAccessToken());
		} else {
			throw new TokenNotFoundException();
		}

		headers.set("appkey", appKey);
		headers.set("appsecret", appSecret);
		headers.set("tr_id", trId);
		if (clientType != null && !clientType.isBlank()) {
			headers.set("custtype", clientType);
		}
		return headers;
	}

	private void validateRequiredFields(String trId) {
		if (trId == null || trId.trim().isEmpty()) {
			throw new TokenInvalidTransactionIdException();
		}
		if (appKey == null || appKey.trim().isEmpty()) {
			throw new TokenMissingAppKeyException();
		}
		if (appSecret == null || appSecret.trim().isEmpty()) {
			throw new TokenMissingAppSecretException();
		}
	}
}
