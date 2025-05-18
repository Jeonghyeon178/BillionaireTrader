package com.billionaire.domain.index.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.billionaire.domain.index.entity.Index;

@Repository
public interface IndexRepository extends JpaRepository<Index, Long> {
	Optional<Index> findTopByTickerOrderByDateDesc(String ticker);

	List<Index> findAllByTicker(String ticker);
}
