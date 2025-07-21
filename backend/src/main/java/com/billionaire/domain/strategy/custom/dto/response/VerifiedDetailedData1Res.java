package com.billionaire.domain.strategy.custom.dto.response;

public record VerifiedDetailedData1Res(
	String zdiv,  // 소수점자리수
	String stat,  // 거래상태정보
	String crec,  // 현재조회종목수
	String trec,  // 전체조회종목수
	String nrec   // Record Count
) {
}
