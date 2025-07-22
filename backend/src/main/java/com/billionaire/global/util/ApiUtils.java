package com.billionaire.global.util;

import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import com.billionaire.global.util.exception.ApiRequestFailedException;
import com.billionaire.global.util.exception.ExternalApiErrorException;
import com.billionaire.global.util.exception.InvalidApiUrlException;
import com.billionaire.global.util.exception.InvalidApiResponseTypeException;

import lombok.extern.slf4j.Slf4j;

import java.util.Map;

@Slf4j
@Component
public class ApiUtils {

	private final RestTemplate restTemplate = new RestTemplate();

	public <T> ResponseEntity<T> getRequest(HttpHeaders headers, String url, Map<String, String> queryParams, Class<T> responseType) {
		validateInputs(url, responseType);
		
		try {
			UriComponentsBuilder uriComponentsBuilder = UriComponentsBuilder.fromHttpUrl(url);
			if (queryParams != null) {
				queryParams.forEach(uriComponentsBuilder::queryParam);
			}
			String finalUrl = uriComponentsBuilder.toUriString();
			HttpEntity<String> requestEntity = new HttpEntity<>(headers);

			return restTemplate.exchange(finalUrl, HttpMethod.GET, requestEntity, responseType);
			
		} catch (RestClientException e) {
			throw new ApiRequestFailedException();
		} catch (Exception e) {
			throw new ExternalApiErrorException();
		}
	}

	public <T> ResponseEntity<T> postRequest(String url, HttpHeaders headers, Map<String, String> requestBody, Class<T> responseType) {
		validateInputs(url, responseType);
		
		try {
			HttpEntity<Map<String, String>> requestEntity = new HttpEntity<>(requestBody, headers);
			
			return restTemplate.exchange(url, HttpMethod.POST, requestEntity, responseType);
			
		} catch (RestClientException e) {
			throw new ApiRequestFailedException();
		} catch (Exception e) {
			throw new ExternalApiErrorException();
		}
	}

	private void validateInputs(String url, Class<?> responseType) {
		if (url == null || url.trim().isEmpty()) {
			throw new InvalidApiUrlException();
		}
		if (responseType == null) {
			throw new InvalidApiResponseTypeException();
		}
	}
}
