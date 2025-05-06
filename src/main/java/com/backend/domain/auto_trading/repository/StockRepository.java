package com.backend.domain.auto_trading.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.backend.domain.auto_trading.entity.Stock;

@Repository
public interface StockRepository extends JpaRepository<Stock, Long> {
	Optional<Stock> findTopByTickerOrderByDateDesc(String ticker);
	Stock findTopByTickerOrderByPriceDesc(String ticker);
	Stock findTopByTickerAndDateAfterOrderByPriceAsc(String ticker, LocalDate date);
	List<Stock> findByTickerAndDateAfterOrderByDateAsc(String ticker, LocalDate date);
}
