package com.backend.domain.account.service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import com.backend.domain.account.dto.mapper.TokenMapper;
import com.backend.domain.account.dto.response.BalanceRes;
import com.backend.domain.account.dto.response.TokenRes;
import com.backend.domain.account.entity.Token;
import com.backend.domain.account.repository.TokenRepository;
import com.backend.domain.auto_trading.dto.response.StockRes;
import com.backend.global.util.ApiUtils;
import com.backend.global.util.TokenUtils;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class AccountService {

	@Value("${ks.app-key}")
	private String APP_KEY;
	@Value("${ks.app-secret}")
	private String APP_SECRET;
	@Value("${ks.account-number}")
	private String accountNumber;
	@Value("${ks.account-product-code}")
	private String accountProductCode;

	private final ObjectMapper objectMapper;
	private final TokenMapper tokenMapper;
	private final TokenRepository tokenRepository;

	private final TokenUtils tokenUtils;
	private final ApiUtils apiUtils;

	private void getAccessToken() {
		RestTemplate restTemplate = new RestTemplate();

		HttpHeaders httpHeaders = new HttpHeaders();
		httpHeaders.setContentType(MediaType.APPLICATION_JSON);

		Map<String, String> requestMap = new HashMap<>();
		requestMap.put("grant_type", "client_credentials");
		requestMap.put("appkey", APP_KEY);
		requestMap.put("appsecret", APP_SECRET);

		// 수정 가능
		String jsonBody;
		try {
			jsonBody = objectMapper.writeValueAsString(requestMap);
		} catch (JsonProcessingException e) {
			// TODO Exception
			throw new RuntimeException(e);
		}

		HttpEntity<String> requestMessage = new HttpEntity<>(jsonBody, httpHeaders);

		String URL = "https://openapi.koreainvestment.com:9443/oauth2/tokenP";
		ResponseEntity<TokenRes> response = restTemplate.exchange(URL, HttpMethod.POST, requestMessage, TokenRes.class);
		log.info("Response body: {}", response.getBody());

		Token token = tokenMapper.toToken(response.getBody());

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

	public ResponseEntity<BalanceRes> getAccount() {

		HttpHeaders httpheaders = tokenUtils.createAuthorizationBody("TTTS3012R");

		String URL = "https://openapi.koreainvestment.com:9443/uapi/overseas-stock/v1/trading/inquire-balance";

		Map<String, String> parameters = new HashMap<>();
		parameters.put("CANO", accountNumber);
		parameters.put("ACNT_PRDT_CD", accountProductCode);
		parameters.put("OVRS_EXCG_CD", "NASD");
		parameters.put("TR_CRCY_CD", "USD");
		parameters.put("CTX_AREA_FK200", "");
		parameters.put("CTX_AREA_NK200", "");

		ResponseEntity<BalanceRes> response = apiUtils.getRequest(httpheaders, URL, parameters, BalanceRes.class);

		log.info("Response body: {}", response.getBody());

		return response;
	}

}
