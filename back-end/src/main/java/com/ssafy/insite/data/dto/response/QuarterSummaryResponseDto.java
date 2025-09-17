package com.ssafy.insite.data.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@AllArgsConstructor
@Builder
public class QuarterSummaryResponseDto {
    private int storCo;                 // 점포_수
    private int similrIndutyStorCo;     // 유사_업종_점포_수
    private double opbizRt;             // 개업_율(%)
    private int opbizStorCo;            // 개업_점포_수
    private double clsbizRt;            // 폐업_률(%)
    private int clsbizStorCo;           // 폐업_점포_수
    private int netIncrease;            // 순증감
}
