package com.ssafy.insite.data.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@AllArgsConstructor
@Builder
public class TradeAreaRepopInfoResponseDto {
    // 기본 식별
    private String  stdrYyquCd;    // 기준_년분기_코드
    private String  trdarSeCd;     // 상권_구분_코드
    private String  trdarSeCdNm;   // 상권_구분_코드_명
    private Integer trdarCd;       // 상권_코드
    private String  trdarCdNm;     // 상권_코드_명

    // 상주인구(총/성별/연령)
    private Integer totRepopCo;
    private Integer mlRepopCo;
    private Integer fmlRepopCo;
    private Integer agrde10RepopCo;
    private Integer agrde20RepopCo;
    private Integer agrde30RepopCo;
    private Integer agrde40RepopCo;
    private Integer agrde50RepopCo;
    private Integer agrde60AboveRepopCo;

    private Integer mag10RepopCo;
    private Integer mag20RepopCo;
    private Integer mag30RepopCo;
    private Integer mag40RepopCo;
    private Integer mag50RepopCo;
    private Integer mag60AboveRepopCo;

    private Integer fag10RepopCo;
    private Integer fag20RepopCo;
    private Integer fag30RepopCo;
    private Integer fag40RepopCo;
    private Integer fag50RepopCo;
    private Integer fag60AboveRepopCo;

    // 가구수
    private Integer totHshldCo;
    private Integer aptHshldCo;
    private Integer nonAptHshldCo;
}
