package com.ssafy.insite.data.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@AllArgsConstructor
@Builder
public class TradeAreaChngeIxInfoResponseDto {
    // 기본 식별
    private String stdrYyquCd;   // 기준_년분기_코드
    private String trdarSeCd;    // 상권_구분_코드
    private String trdarSeCdNm;  // 상권_구분_코드_명
    private Integer trdarCd;     // 상권_코드
    private String trdarCdNm;    // 상권_코드_명

    // 변화 지표
    private String trdarChngeIx;    // 상권_변화_지표
    private String trdarChngeIxNm;  // 상권_변화_지표_명

    // 평균 영업 개월 수
    private Double oprSaleMtAvrg;     // 운영_영업_개월_평균
    private Double clsSaleMtAvrg;     // 폐업_영업_개월_평균
    private Double suOprSaleMtAvrg;   // 서울_운영_영업_개월_평균
    private Double suClsSaleMtAvrg;   // 서울_폐업_영업_개월_평균
}
