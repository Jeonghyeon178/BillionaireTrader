package com.billionaire.domain.stock.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.billionaire.domain.stock.entity.Stock;

@Repository
public interface StockRepository extends JpaRepository<Stock, Long> {
	Optional<Stock> findTopByTickerOrderByDateDesc(String ticker);

	List<Stock> findAllByTicker(String ticker);
}
