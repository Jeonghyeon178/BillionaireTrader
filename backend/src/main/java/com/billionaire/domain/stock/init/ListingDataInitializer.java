package com.billionaire.domain.stock.init;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.billionaire.domain.stock.dto.internal.ListingInfoDto;
import com.billionaire.domain.stock.dto.mapper.ListingInfoMapper;
import com.billionaire.domain.stock.entity.ListingInfo;
import com.billionaire.domain.stock.exception.ListingFileNotFoundException;
import com.billionaire.domain.stock.exception.ListingFileParsingException;
import com.billionaire.domain.stock.repository.ListingInfoRepository;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class ListingDataInitializer implements CommandLineRunner {
	private final ObjectMapper objectMapper;
	private final ListingInfoMapper listingInfoMapper;
	private final ListingInfoRepository listingInfoRepository;
	private static final List<String> FILE_PATHS = List.of(
		"data/AMSMST.json",
		"data/NASMST.json",
		"data/NYSMST.json"
	);

	@Override
	@Transactional
	public void run(String... args) throws Exception {
		if (listingInfoRepository.count() > 0) {
			return;
		}
		FILE_PATHS.forEach(path -> {
			try {
				loadJsonToDatabase(path);
			} catch (IOException e) {
				throw new ListingFileParsingException(path, e);
			} catch (Exception e) {
				throw new RuntimeException("상장 종목 초기화 실패: " + path, e);
			}
		});
	}

	private void loadJsonToDatabase(String filePath) throws IOException {
		ClassPathResource resource = new ClassPathResource(filePath);

		if (!resource.exists()) {
			throw new ListingFileNotFoundException(filePath);
		}

		try (InputStream inputStream = resource.getInputStream()) {
			List<ListingInfoDto> dtoList = objectMapper
				.readerForListOf(ListingInfoDto.class)
				.readValue(inputStream);

			List<ListingInfo> entities = dtoList.stream()
				.map(listingInfoMapper::toEntity)
				.toList();

			listingInfoRepository.saveAllOrElseThrow(entities);

		} catch (IOException e) {
			throw new ListingFileParsingException(filePath, e);
		}
	}
}