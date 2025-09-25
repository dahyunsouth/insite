package com.ssafy.insite.ai.service;

import com.ssafy.insite.ai.dto.response.TradeAreaSummaryResponseDto;

public interface TradeAreaSummaryService {
    // 상권 요약 AI 호출
    TradeAreaSummaryResponseDto getTradeAreaSummary(int trdarCd);
}
