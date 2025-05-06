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
public class Indices {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	private LocalDate tradingDate;
	private Long numberOfConsecutiveRises;
	private Boolean trigger;

	public void updateIndicesData(LocalDate tradingDate, Long numberOfConsecutiveRises, Boolean trigger) {
		this.tradingDate = tradingDate;
        this.numberOfConsecutiveRises = numberOfConsecutiveRises;
		this.trigger = trigger;
	}
	public void updateIndicesData(Long numberOfConsecutiveRises) {
		this.numberOfConsecutiveRises = numberOfConsecutiveRises;
	}
	public void updateIndicesData(Boolean trigger) {
		this.trigger = trigger;
	}
}
