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
        private long thsmonSelngAmt;
        private int thsmonSelngCo;
        private long mdwkSelngAmt;
        private long wkendSelngAmt;
        private int mdwkSelngCo;
        private int wkendSelngCo;
    }

    @Getter
    @Builder
    @AllArgsConstructor
    public static class TradeAreaStorDto {
        private String stdrYyquCd;  // 기준 년분기 코드
        private int storCo;
        private int frcStorCo;
        private BigDecimal opbizRt;
        private int opbizStorCo;
        private BigDecimal clsbizRt;
        private int clsbizStorCo;
    }

    @Getter
    @Builder
    @AllArgsConstructor
    public static class TradeAreaFlpopDto {
        private String stdrYyquCd;  // 기준 년분기 코드
        private int totFlpopCo;
    }

    @Getter
    @Builder
    @AllArgsConstructor
    public static class TradeAreaRepopDto {
        private String stdrYyquCd;  // 기준 년분기 코드
        private int totRepopCo;
    }

    @Getter
    @Builder
    @AllArgsConstructor
    public static class TradeAreaWrcPopltnDto {
        private String stdrYyquCd;  // 기준 년분기 코드
        private int totWrcPopltnCo;
    }
}
