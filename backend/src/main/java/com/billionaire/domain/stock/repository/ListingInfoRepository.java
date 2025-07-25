package com.billionaire.domain.stock.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.billionaire.domain.stock.entity.ListingInfo;
import com.billionaire.domain.stock.exception.ListingSaveFailedException;

public interface ListingInfoRepository extends JpaRepository<ListingInfo, Long> {

	List<ListingInfo> findTop10ByKoreaNameContainingIgnoreCaseOrEnglishNameContainingIgnoreCaseOrSymbolContainingIgnoreCase(
		String koreaName, String englishName, String symbol);

	default <S extends ListingInfo> void saveAllOrElseThrow(Iterable<S> entities) {
		try {
			saveAll(entities);
		} catch (Exception e) {
			throw new ListingSaveFailedException();
		}
	}
}
