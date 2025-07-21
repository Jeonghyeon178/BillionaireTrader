package com.billionaire.domain.strategy.custom.dto.response;

public record VerifiedDetailedData2Res(
	String rsym,   // 실시간조회심볼
	String excd,   // 거래소코드
	String symb,   // 종목코드
	String name,   // 종목명
	// String last,   // 현재가
	// String sign,   // 기호
	// String diff,   // 대비
	// String rate,   // 등락율
	// String tvol,   // 거래량
	// String popen,  // 시가
	// String phigh,  // 고가
	// String plow,   // 저가
	String valx,   // 시가총액
	// String shar,   // 발행주식수
	// String avol,   // 거래대금
	// String eps,    // EPS
	// String per,    // PER
	String rank,   // 순위
	String ename,  // 영문종목명
	String eOrdyn  // 매매가능 여부

) {
}
