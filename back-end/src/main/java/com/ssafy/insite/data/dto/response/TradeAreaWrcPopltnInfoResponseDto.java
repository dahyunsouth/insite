package com.ssafy.insite.data.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@AllArgsConstructor
@Builder
public class TradeAreaWrcPopltnInfoResponseDto {
    private String stdrYyquCd;   // 기준_년분기_코드
    private String trdarSeCd;    // 상권_구분_코드
    private String trdarSeCdNm;  // 상권_구분_코드_명
    private Integer trdarCd;     // 상권_코드
    private String trdarCdNm;    // 상권_코드_명

    private Integer totWrcPopltnCo;       // 총 직장 인구 수
    private Integer mlWrcPopltnCo;        // 남성 직장 인구 수
    private Integer fmlWrcPopltnCo;       // 여성 직장 인구 수

    private Integer agrde10WrcPopltnCo;   // 연령대_10 직장 인구 수
    private Integer agrde20WrcPopltnCo;
    private Integer agrde30WrcPopltnCo;
    private Integer agrde40WrcPopltnCo;
    private Integer agrde50WrcPopltnCo;
    private Integer agrde60AboveWrcPopltnCo;

    private Integer mag10WrcPopltnCo;     // 남성연령대_10 직장 인구 수
    private Integer mag20WrcPopltnCo;
    private Integer mag30WrcPopltnCo;
    private Integer mag40WrcPopltnCo;
    private Integer mag50WrcPopltnCo;
    private Integer mag60AboveWrcPopltnCo;

    private Integer fag10WrcPopltnCo;     // 여성연령대_10 직장 인구 수
    private Integer fag20WrcPopltnCo;
    private Integer fag30WrcPopltnCo;
    private Integer fag40WrcPopltnCo;
    private Integer fag50WrcPopltnCo;
    private Integer fag60AboveWrcPopltnCo;
}
