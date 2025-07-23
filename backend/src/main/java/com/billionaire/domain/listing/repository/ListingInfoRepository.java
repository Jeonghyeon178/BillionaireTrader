package com.billionaire.domain.listing.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.billionaire.domain.listing.entity.ListingInfo;
import com.billionaire.domain.listing.exception.ListingSaveFailedException;

public interface ListingInfoRepository extends JpaRepository<ListingInfo, Long> {

	default <S extends ListingInfo> void saveAllOrElseThrow(Iterable<S> entities) {
		try {
			saveAll(entities);
		} catch (Exception e) {
			throw new ListingSaveFailedException();
		}
	}
}
