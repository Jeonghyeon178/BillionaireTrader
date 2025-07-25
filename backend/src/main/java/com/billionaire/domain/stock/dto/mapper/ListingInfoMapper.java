package com.billionaire.domain.stock.dto.mapper;

import org.springframework.stereotype.Component;

import com.billionaire.domain.stock.dto.internal.ListingInfoDto;
import com.billionaire.domain.stock.entity.ListingInfo;

@Component
public class ListingInfoMapper {
	public ListingInfo toEntity(ListingInfoDto dto) {
		return ListingInfo.builder()
			.exchangeName(dto.exchangeName())
			.symbol(dto.symbol())
			.koreaName(dto.koreaName())
			.englishName(dto.englishName())
			.build();
	}
}
