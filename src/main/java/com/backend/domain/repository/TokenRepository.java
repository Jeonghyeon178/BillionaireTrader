package com.backend.domain.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.backend.domain.entity.Token;

@Repository
public interface TokenRepository extends JpaRepository<Token, Long> {

	Optional<Token> findTopByOrderByIdDesc();
}
