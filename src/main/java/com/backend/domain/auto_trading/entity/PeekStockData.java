package com.backend.domain.auto_trading.entity;

import java.time.LocalDate;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PeekStockData {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	private Double highestClosingPrice;
	private Double lowestClosingPrice;
	private String ticker;
	private LocalDate updateDate;

	public void updateData(Double highestClosingPrice, Double lowestClosingPrice, LocalDate updateDate) {
		this.highestClosingPrice = highestClosingPrice;
        this.lowestClosingPrice = lowestClosingPrice;
        this.updateDate = updateDate;
	}
	public void updateData(Double highestClosingPrice, LocalDate updateDate) {
		this.highestClosingPrice = highestClosingPrice;
		this.updateDate = updateDate;
	}
}
