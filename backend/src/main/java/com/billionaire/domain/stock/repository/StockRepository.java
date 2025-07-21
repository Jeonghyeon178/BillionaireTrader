package com.billionaire.domain.stock.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.billionaire.domain.stock.entity.Stock;
import com.billionaire.domain.stock.exception.InvalidStockTickerException;
import com.billionaire.domain.stock.exception.StockDataNotFoundException;

@Repository
public interface StockRepository extends JpaRepository<Stock, Long> {
	Optional<Stock> findTopByTickerOrderByDateDesc(String ticker);

	List<Stock> findAllByTicker(String ticker);

	default List<Stock> getStockData(String ticker) {
		if (ticker == null || ticker.trim().isEmpty()) {
			throw new InvalidStockTickerException();
		}
		
		List<Stock> data = findAllByTicker(ticker);
		if (data.isEmpty()) {
			throw new StockDataNotFoundException();
		}
		return data;
	}

	default Stock getLatestStockData(String ticker) {
		if (ticker == null || ticker.trim().isEmpty()) {
			throw new com.billionaire.domain.stock.exception.InvalidStockTickerException();
		}
		
		return findTopByTickerOrderByDateDesc(ticker)
			.orElseThrow(StockDataNotFoundException::new);
	}
}
