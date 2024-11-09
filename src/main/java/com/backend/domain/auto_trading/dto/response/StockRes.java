package com.backend.domain.auto_trading.dto.response;

import java.util.List;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public record StockRes(
	String rtCd,       				// 성공 실패 여부
	String msgCd,     		 		// 응답코드
	String msg1,       				// 응답메세지
	StockOutPut1Res output1,		// 응답상세1 (소수점자리수, 거래상태정보 등)
	List<StockOutPut2Res> output2	// 응답상세2 (종목별 상세 정보)
) {

}
