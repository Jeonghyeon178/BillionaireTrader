package com.backend.domain.service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.backend.domain.dto.mapper.TokenMapper;
import com.backend.domain.dto.response.TokenRes;
import com.backend.domain.entity.Token;
import com.backend.domain.repository.TokenRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class ConnectionService {

	@Value("${api.app-key}")
	private String APP_KEY;
	@Value("${api.app-secret}")
	private String APP_SECRET;
	private final ObjectMapper objectMapper;
	private final TokenMapper tokenMapper;
	private final TokenRepository tokenRepository;

	private void getAccessToken() {
		RestTemplate restTemplate = new RestTemplate();

		HttpHeaders httpHeaders = new HttpHeaders();
		httpHeaders.setContentType(MediaType.APPLICATION_JSON);

		Map<String, String> requestMap = new HashMap<>();
		requestMap.put("grant_type", "client_credentials");
		requestMap.put("appkey", APP_KEY);
		requestMap.put("appsecret", APP_SECRET);

		String jsonBody;
		try {
			jsonBody = objectMapper.writeValueAsString(requestMap);
		} catch (JsonProcessingException e) {
			// TODO Exception
			throw new RuntimeException(e);
		}

		HttpEntity<String> requestMessage = new HttpEntity<>(jsonBody, httpHeaders);

		String URL = "https://openapi.koreainvestment.com:9443/oauth2/tokenP";
		HttpEntity<String> response = restTemplate.exchange(URL, HttpMethod.POST, requestMessage, String.class);
		log.info("Response body: {}", response.getBody());

		objectMapper.configure(DeserializationFeature.ACCEPT_EMPTY_STRING_AS_NULL_OBJECT, true);

		TokenRes tokenRes;
		try {
			tokenRes = objectMapper.readValue(response.getBody(), TokenRes.class);
		} catch (JsonProcessingException e) {
			// TODO Exception
			throw new RuntimeException(e);
		}

		Token token = tokenMapper.toToken(tokenRes);

		tokenRepository.save(token);

		log.info("Access token obtained: {}", token.getAccessToken());
		log.info("Token expires at: {}", token.getExpiration());
	}

	public void checkValidToken() {
		Optional<Token> optionalToken = tokenRepository.findTopByOrderByIdDesc();

		LocalDateTime now = LocalDateTime.now();

		optionalToken.ifPresentOrElse(token -> {
			LocalDateTime expirationTime = token.getExpiration();

			if (expirationTime.isBefore(now)) {
				log.info("토큰이 만료되었습니다. 새로운 토큰을 요청합니다.");
				getAccessToken();
			} else {
				log.info("토큰은 아직 유효합니다.");
				log.info(token.getAccessToken());
			}
		}, () -> {
			log.info("저장된 토큰이 없습니다. 새로운 토큰을 요청합니다.");
			getAccessToken();
		});
	}

	public void getAccount() {

		HttpHeaders httpHeaders = new HttpHeaders();
		httpHeaders.setContentType(MediaType.APPLICATION_JSON);
		// httpHeaders.set("authorization", "Bearer " + MyToken);
		httpHeaders.set("appkey", APP_KEY);
		httpHeaders.set("appsecrete", APP_SECRET);
		httpHeaders.set("tr_id", "TTTS3012R");

		Map<String, String> requestMap = new HashMap<>();

	}
}
