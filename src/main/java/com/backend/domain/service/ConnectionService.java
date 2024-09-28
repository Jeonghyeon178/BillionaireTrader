package com.backend.domain.service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.backend.domain.dto.response.TokenRes;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class ConnectionService {

	private final String URL = "https://openapi.koreainvestment.com:9443/oauth2/tokenP";
	@Value("${api.app-key}")
	private String APP_KEY;
	@Value("${api.app-secret}")
	private String APP_SECRET;
	private final ObjectMapper objectMapper;

	public void getAccessToken() throws JsonProcessingException {
		RestTemplate restTemplate = new RestTemplate();

		HttpHeaders httpHeaders = new HttpHeaders();
		httpHeaders.setContentType(MediaType.APPLICATION_JSON);

		Map<String, String> requestMap = new HashMap<>();
		requestMap.put("grant_type", "client_credentials");
		requestMap.put("appkey", APP_KEY);
		requestMap.put("appsecret", APP_SECRET);

		String jsonBody = objectMapper.writeValueAsString(requestMap);

		HttpEntity<String> requestMessage = new HttpEntity<>(jsonBody, httpHeaders);

		HttpEntity<String> response = restTemplate.exchange(URL, HttpMethod.POST, requestMessage, String.class);
		log.info("Response body: {}", response.getBody());

		objectMapper.configure(DeserializationFeature.ACCEPT_EMPTY_STRING_AS_NULL_OBJECT, true);

		TokenRes tokenRes = objectMapper.readValue(response.getBody(), TokenRes.class);

		DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

		log.info("Access token obtained: {}", tokenRes.accessToken());
		log.info("Token expires at: {}", LocalDateTime.parse(tokenRes.accessTokenTokenExpired(), formatter));
	}
}
