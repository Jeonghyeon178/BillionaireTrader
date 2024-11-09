package com.backend.domain.auto_trading.dto.common;

import java.time.LocalDate;

public record NasdaqTriggerInfo(
	Boolean trigger,
	LocalDate date
) {
}
