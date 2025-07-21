package com.billionaire.global.config;

import java.util.Arrays;
import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.billionaire.global.security.CustomUserDetailsService;
import com.billionaire.global.security.RateLimitingFilter;

import lombok.RequiredArgsConstructor;

/**
 * Spring Security 보안 설정
 * 
 * 인증, 인가, CORS, 보안 헤더 등을 설정합니다.
 */
@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

	private final RateLimitingFilter rateLimitingFilter;

	/**
	 * 보안 필터 체인 설정
	 */
	@Bean
	public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
		http
			// 요청 권한 설정
			.authorizeHttpRequests(authorize -> authorize
				// 공개 엔드포인트
				.requestMatchers(
					"/swagger-ui/**", 
					"/v3/api-docs/**", 
					"/swagger-ui.html",
					"/actuator/health"
				).permitAll()
				
				// 읽기 전용 API (인증 필요 없음 - 개발 단계)
				.requestMatchers(
					"/api/account",
					"/api/search/**"
				).permitAll()
				
				// 쓰기 작업 API (인증 필요)
				.requestMatchers(
					"/api/orders/**"
				).authenticated()
				
				// 기타 모든 요청은 인증 필요
				.anyRequest().authenticated()
			)
			
			// CSRF 비활성화 (REST API)
			.csrf(AbstractHttpConfigurer::disable)
			
			// HTTP Basic 인증 활성화
			.httpBasic(Customizer.withDefaults())
			
			// 세션 관리 (Stateless)
			.sessionManagement(session -> 
				session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
			)
			
			// CORS 설정
			.cors(cors -> cors.configurationSource(corsConfigurationSource()))
			
			// 보안 헤더 설정
			.headers(headers -> headers
				.frameOptions(HeadersConfigurer.FrameOptionsConfig::deny)
				.contentTypeOptions(Customizer.withDefaults())
				.httpStrictTransportSecurity(hstsConfig -> hstsConfig
					.maxAgeInSeconds(31536000)
					.includeSubDomains(true)
				)
				.referrerPolicy(referrerPolicy -> 
					referrerPolicy.policy(org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter.ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN)
				)
			)
			
			// Rate Limiting 필터 추가
			.addFilterBefore(rateLimitingFilter, UsernamePasswordAuthenticationFilter.class);
		
		return http.build();
	}

	/**
	 * 비밀번호 인코더 설정
	 */
	@Bean
	public PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}

	/**
	 * CORS 설정
	 */
	@Bean
	public CorsConfigurationSource corsConfigurationSource() {
		CorsConfiguration configuration = new CorsConfiguration();
		
		// 허용된 오리진 (환경별로 분리 가능)
		configuration.setAllowedOrigins(List.of(
			"http://localhost",           // Nginx 도커
			"http://localhost:80",        // Nginx 도커 기본 포트
			"http://localhost:3000",      // React 개발 서버
			"http://localhost:5173"     // Vite 개발 서버
		));
		
		// 허용된 HTTP 메서드
		configuration.setAllowedMethods(Arrays.asList(
			"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"
		));
		
		// 허용된 헤더
		configuration.setAllowedHeaders(List.of(
			"Authorization", 
			"Content-Type", 
			"X-Requested-With",
			"Accept",
			"Origin",
			"Cache-Control"
		));
		
		// 노출할 헤더
		configuration.setExposedHeaders(List.of(
			"Authorization",
			"X-Total-Count"
		));
		
		// 자격 증명 허용
		configuration.setAllowCredentials(true);
		
		// 캐시 시간 (1시간)
		configuration.setMaxAge(3600L);

		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		source.registerCorsConfiguration("/**", configuration);
		return source;
	}
}