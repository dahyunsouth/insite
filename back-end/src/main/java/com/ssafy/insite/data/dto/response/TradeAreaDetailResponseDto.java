package com.ssafy.insite.data.dto.response;

import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import org.jooq.types.UInteger;
import org.jooq.types.ULong;

@Getter
@AllArgsConstructor
@Builder
public class TradeAreaDetailResponseDto {
    private int trdarCd;     // 상권 코드
    private String trdarCdNm;   // 상권 코드명

    private TradeAreaTrdarChngeIxDto chnge;
    private TradeAreaSalesDto sales;
    private TradeAreaStorDto stor;
    private TradeAreaFlpopDto flpop;
    private TradeAreaRepopDto repop;
    private TradeAreaWrcPopltnDto wrc;

    @Getter
    @Builder
    @AllArgsConstructor
    public static class TradeAreaTrdarChngeIxDto {
        private String stdrYyquCd;  // 기준 년분기 코드
        private String trdrChngeIx;
    }

    @Getter
    @Builder
    @AllArgsConstructor
    public static class TradeAreaSalesDto {
        private String stdrYyquCd;  // 기준 년분기 코드
        private ULong thsmonSelngAmt;
        private UInteger thsmonSelngCo;
        private ULong mdwkSelngAmt;
        private ULong wkendSelngAmt;
        private UInteger mdwkSelngCo;
        private UInteger wkendSelngCo;
    }

    @Getter
    @Builder
    @AllArgsConstructor
    public static class TradeAreaStorDto {
        private String stdrYyquCd;  // 기준 년분기 코드
        private UInteger storCo;
        private UInteger frcStorCo;
        private BigDecimal opbizRt;
        private UInteger opbizStorCo;
        private BigDecimal clsbizRt;
        private UInteger clsbizStorCo;
    }

    @Getter
    @Builder
    @AllArgsConstructor
    public static class TradeAreaFlpopDto {
        private UInteger stdrYyquCd;  // 기준 년분기 코드
        private UInteger totFlpopCo;
    }

    @Getter
    @Builder
    @AllArgsConstructor
    public static class TradeAreaRepopDto {
        private String stdrYyquCd;  // 기준 년분기 코드
        private UInteger totRepopCo;
    }

    @Getter
    @Builder
    @AllArgsConstructor
    public static class TradeAreaWrcPopltnDto {
        private String stdrYyquCd;  // 기준 년분기 코드
        private UInteger totWrcPopltnCo;
    }
}
