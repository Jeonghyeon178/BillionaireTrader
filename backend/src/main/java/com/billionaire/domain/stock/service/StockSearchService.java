package com.billionaire.domain.stock.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.billionaire.domain.stock.dto.internal.ListingInfoDto;
import com.billionaire.domain.stock.entity.ListingInfo;
import com.billionaire.domain.stock.repository.ListingInfoRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class StockSearchService {
	private final ListingInfoRepository listingInfoRepository;

	public List<ListingInfoDto> searchStocks(String query) {
		return listingInfoRepository.findTop10ByKoreaNameContainingIgnoreCaseOrEnglishNameContainingIgnoreCaseOrSymbolContainingIgnoreCase(
			query, query, query)
			.stream()
			.map(this::convertToDto)
			.toList();
	}

	private ListingInfoDto convertToDto(ListingInfo listingInfo) {
		return new ListingInfoDto(
			listingInfo.getExchangeName(),
			listingInfo.getSymbol(),
			listingInfo.getKoreaName(),
			listingInfo.getEnglishName()
		);
	}
}