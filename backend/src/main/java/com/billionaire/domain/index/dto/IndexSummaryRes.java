package com.billionaire.domain.index.dto;

public record IndexSummaryRes(
	String ticker,
	double rate,
	double price
) {}
