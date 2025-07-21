package com.billionaire.global.config;

import jakarta.validation.Validator;
import org.springframework.context.MessageSource;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.support.ReloadableResourceBundleMessageSource;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;

/**
 * Bean Validation 설정
 */
@Configuration
public class ValidationConfig {

    /**
     * 검증 오류 메시지를 위한 메시지 소스 설정
     */
    @Bean
    public MessageSource messageSource() {
        ReloadableResourceBundleMessageSource messageSource = new ReloadableResourceBundleMessageSource();
        messageSource.setBasename("classpath:messages/validation");
        messageSource.setDefaultEncoding("UTF-8");
        messageSource.setCacheSeconds(300); // 5분 동안 캐시
        return messageSource;
    }

    /**
     * 커스텀 메시지 소스를 사용하는 검증 팩토리 설정
     */
    @Bean
    public LocalValidatorFactoryBean validator() {
        LocalValidatorFactoryBean bean = new LocalValidatorFactoryBean();
        bean.setValidationMessageSource(messageSource());
        return bean;
    }

    /**
     * 기본 검증기 빈
     */
    @Bean
    public Validator validatorBean() {
        return validator();
    }
}