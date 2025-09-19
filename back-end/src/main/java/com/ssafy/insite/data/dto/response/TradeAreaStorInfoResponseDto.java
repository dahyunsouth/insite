package com.ssafy.insite.data.dto.response;

import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import org.jooq.types.UInteger;

@Getter
@AllArgsConstructor
@Builder
public class TradeAreaStorInfoResponseDto {
    private String stdrYyquCd;              // 기준_년분기_코드
    private String trdarSeCd;               // 상권_구분_코드
    private String trdarSeCdNm;             // 상권_구분_코드_명
    private int trdarCd;                    // 상권_코드
    private String trdarCdNm;               // 상권_코드_명
    private UInteger storCo;                // 점포_수
    private UInteger similrIndutyStorCo;    // 유사_업종_점포_수
    private BigDecimal opbizRt;             // 개업_율(%)
    private UInteger opbizStorCo;           // 개업_점포_수
    private BigDecimal clsbizRt;            // 폐업_률(%)
    private UInteger clsbizStorCo;          // 폐업_점포_수
    private UInteger frcStorCo;             // 프랜차이즈_점포_수
    private int netIncrease;                // 순증감
}
