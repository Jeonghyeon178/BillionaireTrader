package com.backend.domain.auto_trading.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.backend.domain.auto_trading.entity.Indices;

@Repository
public interface IndicesRepository extends JpaRepository<Indices, Long> {
}
