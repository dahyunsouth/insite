package com.ssafy.insite.ai.dto.response;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class TradeAreaSummaryResponseDto {
    private String summary;
    private List<String> features;
}
