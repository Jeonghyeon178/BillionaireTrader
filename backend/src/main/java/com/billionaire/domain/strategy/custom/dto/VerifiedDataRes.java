package com.billionaire.domain.strategy.custom.dto;

import java.util.List;

public record VerifiedDataRes(
	String rtCd,                    // 성공 실패 여부
	String msgCd,                    // 응답코드
	String msg1,                    // 응답메세지
	VerifiedDetailedData1Res output1,        // 응답상세1 (소수점자리수, 거래상태정보 등)
	List<VerifiedDetailedData2Res> output2    // 응답상세2 (종목별 상세 정보)
) {

}
