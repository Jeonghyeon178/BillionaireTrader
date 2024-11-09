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
public class Nasdaq {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	private LocalDate tradingDate;
	private Long numberOfConsecutiveRises;
	private Boolean trigger;

	public void updateNasdaqData(LocalDate tradingDate, Long numberOfConsecutiveRises, Boolean trigger) {
		this.tradingDate = tradingDate;
        this.numberOfConsecutiveRises = numberOfConsecutiveRises;
		this.trigger = trigger;
	}
	public void updateNasdaqData(Long numberOfConsecutiveRises) {
		this.numberOfConsecutiveRises = numberOfConsecutiveRises;
	}
	public void updateNasdaqData(Boolean trigger) {
		this.trigger = trigger;
	}
}
