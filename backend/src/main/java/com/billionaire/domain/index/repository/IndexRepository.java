package com.billionaire.domain.index.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.billionaire.domain.index.entity.Index;
import com.billionaire.domain.index.exception.IndexDataNotFoundException;
import com.billionaire.domain.index.exception.InvalidIndexTickerException;

@Repository
public interface IndexRepository extends JpaRepository<Index, Long> {
	Optional<Index> findTopByTickerOrderByDateDesc(String ticker);

	List<Index> findAllByTicker(String ticker);

	default List<Index> getIndexData(String ticker) {
		if (ticker == null || ticker.trim().isEmpty()) {
			throw new InvalidIndexTickerException();
		}
		
		List<Index> data = findAllByTicker(ticker);
		if (data.isEmpty()) {
			throw new IndexDataNotFoundException();
		}
		return data;
	}

	default Index getLatestIndexData(String ticker) {
		if (ticker == null || ticker.trim().isEmpty()) {
			throw new InvalidIndexTickerException();
		}
		
		return findTopByTickerOrderByDateDesc(ticker)
			.orElseThrow(IndexDataNotFoundException::new);
	}

	default List<Index> getAllIndexDataByTicker(String ticker) {
		if (ticker == null || ticker.trim().isEmpty()) {
			throw new InvalidIndexTickerException();
		}
		
		List<Index> data = findAllByTicker(ticker);
		if (data.isEmpty()) {
			throw new IndexDataNotFoundException();
		}
		return data;
	}


}
