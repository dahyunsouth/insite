package com.ssafy.insite.data.dto.response;

import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@AllArgsConstructor
@Builder
public class TradeAreaScoreResponseDto {
    private String district;    // 자치구
    private String dong;        // 행정동
    private String areaName;                 // 상권명
    private String areaType;                 // 상권유형
    private BigDecimal totalScore;           // 종합 점수
    private BigDecimal sustainabilityScore;  // 지속성 점수
    private BigDecimal profitabilityScore;   // 수익성 점수
    private BigDecimal accessibilityScore;   // 접근성 점수
    private BigDecimal riskScore;            // 위험도 점수
    private BigDecimal competitionScore;     // 경쟁강도
}
