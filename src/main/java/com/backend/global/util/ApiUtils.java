package com.backend.global.util;

import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.Map;

@Component
public class ApiUtils {

	private final RestTemplate restTemplate = new RestTemplate();

	public <T> ResponseEntity<T> getRequest(HttpHeaders headers, String url, Map<String, String> queryParams, Class<T> responseType) {

		UriComponentsBuilder uriComponentsBuilder = UriComponentsBuilder.fromHttpUrl(url);
		queryParams.forEach(uriComponentsBuilder::queryParam);
		String finalUrl = uriComponentsBuilder.toUriString();
		HttpEntity<String> requestEntity = new HttpEntity<>(headers);

		return restTemplate.exchange(finalUrl, HttpMethod.GET, requestEntity, responseType);
	}
}
