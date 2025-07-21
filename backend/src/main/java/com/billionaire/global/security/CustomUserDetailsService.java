package com.billionaire.global.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 사용자 인증 서비스
 * 
 * 현재는 환경변수 기반의 단일 사용자 인증을 지원합니다.
 * 향후 데이터베이스 기반 사용자 관리로 확장 가능합니다.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final PasswordEncoder passwordEncoder;

    @Value("${AUTH_USERNAME:admin}")
    private String authUsername;

    @Value("${AUTH_PASSWORD:admin123}")
    private String authPassword;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        log.debug("사용자 인증 시도: {}", username);

        // 현재는 단일 사용자만 지원
        if (!authUsername.equals(username)) {
            log.warn("존재하지 않는 사용자: {}", username);
            throw new UsernameNotFoundException("사용자를 찾을 수 없습니다: " + username);
        }

        // 사용자 정보 반환
        UserDetails user = User.builder()
                .username(authUsername)
                .password(passwordEncoder.encode(authPassword))
                .roles("USER", "TRADER") // 기본 역할
                .accountExpired(false)
                .accountLocked(false)
                .credentialsExpired(false)
                .disabled(false)
                .build();

        log.debug("사용자 인증 성공: {}", username);
        return user;
    }

    /**
     * 사용자 인증 정보 검증
     * 
     * @param username 사용자명
     * @param rawPassword 평문 비밀번호
     * @return 인증 성공 여부
     */
    public boolean validateUser(String username, String rawPassword) {
        try {
            UserDetails user = loadUserByUsername(username);
            return passwordEncoder.matches(rawPassword, user.getPassword());
        } catch (UsernameNotFoundException e) {
            log.warn("사용자 검증 실패: {}", e.getMessage());
            return false;
        }
    }
}