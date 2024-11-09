package com.backend.domain.auto_trading.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.backend.domain.auto_trading.entity.PeekStockData;

@Repository
public interface PeekStockDataRepository extends JpaRepository<PeekStockData, Long> {

	Optional<PeekStockData> findByTicker(String symb);
}
