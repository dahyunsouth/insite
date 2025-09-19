package com.ssafy.insite.data.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@AllArgsConstructor
@Builder
public class TradeAreaSalesInfoResponseDto {
    // 기본 식별
    private String stdrYyquCd;    // 기준_년분기_코드
    private String trdarSeCd;     // 상권_구분_코드
    private String trdarSeCdNm;   // 상권_구분_코드_명
    private Integer trdarCd;      // 상권_코드
    private String trdarCdNm;     // 상권_코드_명
    private String svcIndutyCd;   // 서비스_업종_코드
    private String svcIndutyCdNm; // 서비스_업종_코드_명

    // 매출 금액
    private Long thsmonSelngAmt;
    private Long mdwkSelngAmt;
    private Long wkendSelngAmt;
    private Long monSelngAmt;
    private Long tuesSelngAmt;
    private Long wedSelngAmt;
    private Long thurSelngAmt;
    private Long friSelngAmt;
    private Long satSelngAmt;
    private Long sunSelngAmt;
    private Long tmzon0006SelngAmt;
    private Long tmzon0611SelngAmt;
    private Long tmzon1114SelngAmt;
    private Long tmzon1417SelngAmt;
    private Long tmzon1721SelngAmt;
    private Long tmzon2124SelngAmt;
    private Long mlSelngAmt;
    private Long fmlSelngAmt;
    private Long agrde10SelngAmt;
    private Long agrde20SelngAmt;
    private Long agrde30SelngAmt;
    private Long agrde40SelngAmt;
    private Long agrde50SelngAmt;
    private Long agrde60AboveSelngAmt;

    // 매출 건수
    private Integer thsmonSelngCo;
    private Integer mdwkSelngCo;
    private Integer wkendSelngCo;
    private Integer monSelngCo;
    private Integer tuesSelngCo;
    private Integer wedSelngCo;
    private Integer thurSelngCo;
    private Integer friSelngCo;
    private Integer satSelngCo;
    private Integer sunSelngCo;
    private Integer tmzon0006SelngCo;
    private Integer tmzon0611SelngCo;
    private Integer tmzon1114SelngCo;
    private Integer tmzon1417SelngCo;
    private Integer tmzon1721SelngCo;
    private Integer tmzon2124SelngCo;
    private Integer mlSelngCo;
    private Integer fmlSelngCo;
    private Integer agrde10SelngCo;
    private Integer agrde20SelngCo;
    private Integer agrde30SelngCo;
    private Integer agrde40SelngCo;
    private Integer agrde50SelngCo;
    private Integer agrde60AboveSelngCo;
}
