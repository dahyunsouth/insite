package com.ssafy.insite.data.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@AllArgsConstructor
@Builder
public class TradeAreaFlpopInfoResponseDto {
    // 기본 식별
    private Integer stdrYyquCd;   // 기준_년분기_코드
    private String  trdarSeCd;    // 상권_구분_코드
    private String  trdarSeCdNm;  // 상권_구분_코드_명
    private Integer trdarCd;      // 상권_코드
    private String  trdarCdNm;    // 상권_코드_명

    // 유동인구 (총/성별/연령)
    private Integer totFlpopCo;
    private Integer mlFlpopCo;
    private Integer fmlFlpopCo;
    private Integer agrde10FlpopCo;
    private Integer agrde20FlpopCo;
    private Integer agrde30FlpopCo;
    private Integer agrde40FlpopCo;
    private Integer agrde50FlpopCo;
    private Integer agrde60AboveFlpopCo;

    // 시간대별
    private Integer tmzon0006FlpopCo;
    private Integer tmzon0611FlpopCo;
    private Integer tmzon1114FlpopCo;
    private Integer tmzon1417FlpopCo;
    private Integer tmzon1721FlpopCo;
    private Integer tmzon2124FlpopCo;

    // 요일별
    private Integer monFlpopCo;
    private Integer tuesFlpopCo;
    private Integer wedFlpopCo;
    private Integer thurFlpopCo;
    private Integer friFlpopCo;
    private Integer satFlpopCo;
    private Integer sunFlpopCo;
}
