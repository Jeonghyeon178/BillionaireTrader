package com.backend.domain.token.service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.backend.domain.account.dto.response.TokenRes;
import com.backend.domain.account.entity.Token;
import com.backend.domain.token.dto.mapper.TokenMapper;
import com.backend.domain.token.repository.TokenRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
@Transactional
public class TokenService {

	private final ObjectMapper objectMapper;
	private final TokenMapper tokenMapper;
	private final TokenRepository tokenRepository;
	@Value("${ks.app-key}")
	private String APP_KEY;
	@Value("${ks.app-secret}")
	private String APP_SECRET;

	public void validateOrRefreshToken() {
		Optional<Token> optionalToken = tokenRepository.findTopByOrderByIdDesc();
		LocalDateTime now = LocalDateTime.now();

		optionalToken.ifPresentOrElse(
			token -> {
				if (token.getExpiration().isBefore(now)) {
					log.info("토큰이 만료되었습니다. 새로운 토큰을 요청합니다.");
					requestNewAccessToken();
				} else {
					log.info("토큰은 아직 유효합니다: {}", token.getAccessToken());
				}
			},
			() -> {
				log.info("저장된 토큰이 없습니다. 새로운 토큰을 요청합니다.");
				requestNewAccessToken();
			}
		);
	}

	private void requestNewAccessToken() {
		try {
			requestAccessTokenFromApi();
		} catch (JsonProcessingException e) {
			throw new RuntimeException("토큰 발급 중 JSON 처리 에러가 발생했습니다.", e);
		}
	}

	private void requestAccessTokenFromApi() throws JsonProcessingException {
		RestTemplate restTemplate = new RestTemplate();

		HttpHeaders httpHeaders = new HttpHeaders();
		httpHeaders.setContentType(MediaType.APPLICATION_JSON);

		Map<String, String> requestMap = new HashMap<>();
		requestMap.put("grant_type", "client_credentials");
		requestMap.put("appkey", APP_KEY);
		requestMap.put("appsecret", APP_SECRET);

		ResponseEntity<TokenRes> response = restTemplate.exchange(
			"https://openapi.koreainvestment.com:9443/oauth2/tokenP",
			HttpMethod.POST,
			new HttpEntity<>(objectMapper.writeValueAsString(requestMap), httpHeaders),
			TokenRes.class
		);

		Token token = tokenMapper.toToken(Objects.requireNonNull(response.getBody()));

		tokenRepository.save(token);

		log.info("발급된 토큰: {}, 만료기간: {}", token.getAccessToken(), token.getExpiration());
	}
}
