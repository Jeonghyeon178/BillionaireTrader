package com.billionaire.global.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.StringUtils;

import jakarta.annotation.PostConstruct;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;

/**
 * 환경변수 설정 검증 및 관리
 * 
 * 애플리케이션 시작 시 필수 환경변수가 설정되었는지 검증합니다.
 */
@Slf4j
@Configuration
@ConfigurationProperties(prefix = "app")
@Getter
public class EnvironmentConfig {

    @Value("${DB_PASSWORD:}")
    private String dbPassword;

    @Value("${KS_APP_KEY:}")
    private String ksAppKey;

    @Value("${KS_APP_SECRET:}")
    private String ksAppSecret;

    @Value("${KS_ACCOUNT_NUMBER:}")
    private String ksAccountNumber;

    @Value("${KS_ACCOUNT_PRODUCT_CODE:}")
    private String ksAccountProductCode;

    @Value("${spring.profiles.active:default}")
    private String activeProfile;

    /**
     * 애플리케이션 시작 시 필수 환경변수 검증
     */
    @PostConstruct
    public void validateEnvironmentVariables() {
        log.info("환경변수 검증을 시작합니다. 활성 프로파일: {}", activeProfile);

        // 필수 환경변수 검증
        validateRequired("DB_PASSWORD", dbPassword);
        validateRequired("KS_APP_KEY", ksAppKey);
        validateRequired("KS_APP_SECRET", ksAppSecret);
        validateRequired("KS_ACCOUNT_NUMBER", ksAccountNumber);
        validateRequired("KS_ACCOUNT_PRODUCT_CODE", ksAccountProductCode);

        log.info("모든 필수 환경변수가 올바르게 설정되었습니다.");

        // 개발 환경에서만 경고 메시지 출력
        if ("dev".equals(activeProfile) || "default".equals(activeProfile)) {
            log.warn("개발 환경에서 실행 중입니다. 운영 환경에서는 모든 환경변수를 안전하게 설정하세요.");
        }
    }

    /**
     * 필수 환경변수 검증
     */
    private void validateRequired(String name, String value) {
        if (!StringUtils.hasText(value)) {
            String errorMessage = String.format(
                "필수 환경변수 '%s'가 설정되지 않았습니다. " +
                ".env 파일을 확인하거나 시스템 환경변수를 설정해주세요.", name);
            log.error(errorMessage);
            throw new IllegalStateException(errorMessage);
        }
        log.debug("환경변수 '{}' 설정 확인됨", name);
    }

    /**
     * 환경변수 설정 상태 로깅 (마스킹 처리)
     */
    public void logConfigurationStatus() {
        log.info("=== 환경변수 설정 상태 ===");
        log.info("활성 프로파일: {}", activeProfile);
        log.info("DB_PASSWORD: {}", maskSensitiveData(dbPassword));
        log.info("KS_APP_KEY: {}", maskSensitiveData(ksAppKey));
        log.info("KS_APP_SECRET: {}", maskSensitiveData(ksAppSecret));
        log.info("KS_ACCOUNT_NUMBER: {}", maskSensitiveData(ksAccountNumber));
        log.info("KS_ACCOUNT_PRODUCT_CODE: {}", maskSensitiveData(ksAccountProductCode));
        log.info("========================");
    }

    /**
     * 민감정보 마스킹 처리
     */
    private String maskSensitiveData(String data) {
        if (!StringUtils.hasText(data)) {
            return "미설정";
        }
        if (data.length() <= 4) {
            return "*".repeat(data.length());
        }
        return data.substring(0, 2) + "*".repeat(data.length() - 4) + data.substring(data.length() - 2);
    }
}