package com.ssafy.insite.data.dto.response;

import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@AllArgsConstructor
@Builder
public class RecommendationItemDto {
    private Integer ranking;                 // 순위 (1,2,3)
    private String areaName;                 // 상권명
    private BigDecimal totalScore;           // 종합 점수
    private BigDecimal sustainabilityScore;  // 지속성 점수
    private BigDecimal profitabilityScore;   // 수익성 점수
    private BigDecimal accessibilityScore;   // 접근성 점수
    private BigDecimal riskScore;            // 위험도 점수
    private BigDecimal competitionScore;     // 경쟁강도
}
