package com.ssafy.insite.ai.controller;

import com.ssafy.insite.ai.dto.response.TradeAreaSummaryResponseDto;
import com.ssafy.insite.ai.service.TradeAreaSummaryService;
import com.ssafy.insite.common.dto.response.BaseResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/ai")
@RequiredArgsConstructor
public class TradeAreaSummaryController {
    private final TradeAreaSummaryService tradeAreaSummaryService;

    @GetMapping("/summary/{trdarCd}")
    @Operation(summary = "상권 요약 AI 호출")
    public BaseResponse<TradeAreaSummaryResponseDto> getTradeAreaSummary(
            @Parameter(description = "상권코드")
            @PathVariable int trdarCd
    ) {
        TradeAreaSummaryResponseDto response = tradeAreaSummaryService.getTradeAreaSummary(trdarCd);
        return new BaseResponse<>(response);
    }
}
