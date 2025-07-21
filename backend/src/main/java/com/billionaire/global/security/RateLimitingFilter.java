package com.billionaire.global.security;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;

/**
 * Rate Limiting 필터
 * 
 * IP 주소별로 요청 횟수를 제한하여 과도한 요청을 방지합니다.
 */
@Slf4j
@Component
public class RateLimitingFilter extends OncePerRequestFilter {

    // IP별 요청 기록을 저장하는 맵
    private final ConcurrentHashMap<String, RequestCounter> requestCounts = new ConcurrentHashMap<>();
    
    // 시간 윈도우 (분)
    private static final int TIME_WINDOW_MINUTES = 1;
    
    // 최대 요청 횟수
    private static final int MAX_REQUESTS_PER_WINDOW = 100;
    
    // 주문 API 최대 요청 횟수 (더 엄격하게)
    private static final int MAX_ORDER_REQUESTS_PER_WINDOW = 10;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, 
            FilterChain filterChain) throws ServletException, IOException {

        String clientIp = getClientIpAddress(request);
        String requestUri = request.getRequestURI();
        
        // Rate limiting 검사
        if (isRateLimited(clientIp, requestUri)) {
            handleRateLimitExceeded(response, clientIp);
            return;
        }

        // 요청 횟수 기록
        recordRequest(clientIp, requestUri);
        
        // 다음 필터로 진행
        filterChain.doFilter(request, response);
    }

    /**
     * Rate limiting 검사
     */
    private boolean isRateLimited(String clientIp, String requestUri) {
        RequestCounter counter = requestCounts.get(clientIp);
        
        if (counter == null) {
            return false; // 첫 요청인 경우
        }

        // 시간 윈도우 확인
        if (isTimeWindowExpired(counter.getLastRequestTime())) {
            return false; // 시간 윈도우가 만료된 경우
        }

        // 요청 횟수 확인
        int maxRequests = isOrderApi(requestUri) ? MAX_ORDER_REQUESTS_PER_WINDOW : MAX_REQUESTS_PER_WINDOW;
        
        return counter.getRequestCount() >= maxRequests;
    }

    /**
     * 요청 기록
     */
    private void recordRequest(String clientIp, String requestUri) {
        RequestCounter counter = requestCounts.get(clientIp);
        LocalDateTime now = LocalDateTime.now();

        if (counter == null || isTimeWindowExpired(counter.getLastRequestTime())) {
            // 새로운 카운터 생성 또는 리셋
            requestCounts.put(clientIp, new RequestCounter(1, now));
        } else {
            // 기존 카운터 증가
            counter.incrementCount();
            counter.setLastRequestTime(now);
        }
    }

    /**
     * 시간 윈도우 만료 확인
     */
    private boolean isTimeWindowExpired(LocalDateTime lastRequestTime) {
        return ChronoUnit.MINUTES.between(lastRequestTime, LocalDateTime.now()) >= TIME_WINDOW_MINUTES;
    }

    /**
     * 주문 API 여부 확인
     */
    private boolean isOrderApi(String requestUri) {
        return requestUri != null && requestUri.startsWith("/api/orders");
    }

    /**
     * Rate limit 초과 처리
     */
    private void handleRateLimitExceeded(HttpServletResponse response, String clientIp) throws IOException {
        log.warn("Rate limit exceeded for IP: {}", clientIp);
        
        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        // 에러 응답 생성
        String errorResponse = new ObjectMapper().writeValueAsString(
            new RateLimitErrorResponse(
                HttpStatus.TOO_MANY_REQUESTS.value(),
                "요청 한도를 초과했습니다",
                "잠시 후 다시 시도해주세요",
                LocalDateTime.now().toString()
            )
        );

        response.getWriter().write(errorResponse);
    }

    /**
     * 클라이언트 IP 주소 추출
     */
    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }
        
        return request.getRemoteAddr();
    }

    /**
     * 요청 카운터 내부 클래스
     */
    private static class RequestCounter {
        private int requestCount;
        private LocalDateTime lastRequestTime;

        public RequestCounter(int requestCount, LocalDateTime lastRequestTime) {
            this.requestCount = requestCount;
            this.lastRequestTime = lastRequestTime;
        }

        public int getRequestCount() {
            return requestCount;
        }

        public void incrementCount() {
            this.requestCount++;
        }

        public LocalDateTime getLastRequestTime() {
            return lastRequestTime;
        }

        public void setLastRequestTime(LocalDateTime lastRequestTime) {
            this.lastRequestTime = lastRequestTime;
        }
    }

    /**
     * Rate limit 오류 응답 클래스
     */
    private record RateLimitErrorResponse(
        int status,
        String error,
        String message,
        String timestamp
    ) {}
}