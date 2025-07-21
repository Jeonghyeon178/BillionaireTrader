package com.billionaire.domain.token.service;

import java.time.LocalDateTime;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.billionaire.domain.token.dto.response.TokenRes;
import com.billionaire.domain.token.entity.Token;
import com.billionaire.domain.token.dto.mapper.TokenMapper;
import com.billionaire.domain.token.exception.TokenCreationFailedException;
import com.billionaire.domain.token.exception.TokenNotFoundException;
import com.billionaire.domain.token.repository.TokenRepository;
import com.billionaire.global.util.ApiUtils;
import com.fasterxml.jackson.core.JsonProcessingException;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class TokenService {

	private static final String URL = "https://openapi.koreainvestment.com:9443/oauth2/tokenP";
	private final TokenMapper tokenMapper;
	private final TokenRepository tokenRepository;
	private final ApiUtils apiUtils;
	@Value("${ks.app-key}")
	private String APP_KEY;
	@Value("${ks.app-secret}")
	private String APP_SECRET;

	@Transactional
	public void validateOrRefreshToken() {
		try {
			Token token = tokenRepository.getLatestToken();
			if (token.getExpiration().isBefore(LocalDateTime.now())) {
				log.info("토큰이 만료되었습니다. 새로운 토큰을 요청합니다.");
				requestNewAccessToken();
			} else {
				log.info("토큰은 아직 유효합니다: {}", token.getAccessToken());
			}
		} catch (TokenNotFoundException e) {
			log.info("저장된 토큰이 없습니다. 새로운 토큰을 요청합니다.");
			requestNewAccessToken();
		}
	}

	private void requestNewAccessToken() {
		try {
			requestAccessTokenFromApi();
		} catch (JsonProcessingException e) {
			throw new TokenCreationFailedException();
		}
	}

	private void requestAccessTokenFromApi() throws JsonProcessingException {
		try {
			HttpHeaders httpHeaders = new HttpHeaders();
			httpHeaders.setContentType(MediaType.APPLICATION_JSON);

			Map<String, String> requestMap = Map.of(
				"grant_type", "client_credentials",
				"appkey", APP_KEY,
				"appsecret", APP_SECRET
				);

			ResponseEntity<TokenRes> response = apiUtils.postRequest(
				URL,
				httpHeaders,
				requestMap,
				TokenRes.class
			);

			if (response.getBody() == null) {
				throw new TokenCreationFailedException();
			}

			Token token = tokenMapper.toToken(response.getBody());
			tokenRepository.save(token);

			log.info("발급된 토큰: {}, 만료기간: {}", token.getAccessToken(), token.getExpiration());
		} catch (Exception e) {
			throw new TokenCreationFailedException();
		}
	}
}
