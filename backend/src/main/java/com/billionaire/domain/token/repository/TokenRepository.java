package com.billionaire.domain.token.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.billionaire.domain.token.entity.Token;
import com.billionaire.domain.token.exception.TokenNotFoundException;

@Repository
public interface TokenRepository extends JpaRepository<Token, Long> {

	Optional<Token> findTopByOrderByIdDesc();

	default Token getLatestToken() {
		return findTopByOrderByIdDesc()
			.orElseThrow(TokenNotFoundException::new);
	}
}
