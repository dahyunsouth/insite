package com.ssafy.insite.data.repository;

import static com.ssafy.insite.data.jooq.codegen.Tables.*;

import com.ssafy.insite.common.dto.response.BaseResponseStatus;
import com.ssafy.insite.common.exception.BaseException;
import com.ssafy.insite.data.dto.response.TradeAreaDetailResponseDto;
import com.ssafy.insite.data.dto.response.TradeAreaDetailResponseDto.*;
import java.math.BigDecimal;
import lombok.RequiredArgsConstructor;
import org.jooq.DSLContext;
import org.jooq.Record2;
import org.jooq.Record3;
import org.jooq.Record8;
import org.jooq.types.UInteger;
import org.jooq.types.ULong;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class TradeAreaDetailRepository {
    private final DSLContext dsl;

    private static Integer toInteger(UInteger v)    { return v == null ? 0 : v.intValue(); }
    private static Long    toLong(ULong v)          { return v == null ? 0L : v.longValue(); }
    private static BigDecimal toBigDecimal(BigDecimal v) { return v == null ? BigDecimal.ZERO : v; }
    private static String  nz(String v)             { return v == null ? "0000" : v; }
    private static String  nz(UInteger v)           { return v == null ? "0000" : v.toString(); }

    private static TradeAreaTrdarChngeIxDto defaultChnge() {
        return TradeAreaTrdarChngeIxDto.builder()
                .stdrYyquCd("0000")
                .trdrChngeIx("0")
                .build();
    }

    private static TradeAreaSalesDto defaultSales() {
        return TradeAreaSalesDto.builder()
                .stdrYyquCd("0000")
                .thsmonSelngAmt(0L)
                .thsmonSelngCo(0)
                .mdwkSelngAmt(0L)
                .wkendSelngAmt(0L)
                .mdwkSelngCo(0)
                .wkendSelngCo(0)
                .build();
    }

    private static TradeAreaStorDto defaultStor() {
        return TradeAreaStorDto.builder()
                .stdrYyquCd("0000")
                .storCo(0)
                .frcStorCo(0)
                .opbizRt(BigDecimal.ZERO)
                .opbizStorCo(0)
                .clsbizRt(BigDecimal.ZERO)
                .clsbizStorCo(0)
                .build();
    }

    private static TradeAreaFlpopDto defaultFlpop() {
        return TradeAreaFlpopDto.builder()
                .stdrYyquCd("0000")
                .totFlpopCo(0)
                .build();
    }

    private static TradeAreaRepopDto defaultRepop() {
        return TradeAreaRepopDto.builder()
                .stdrYyquCd("0000")
                .totRepopCo(0)
                .build();
    }

    private static TradeAreaWrcPopltnDto defaultWrc() {
        return TradeAreaWrcPopltnDto.builder()
                .stdrYyquCd("0000")
                .totWrcPopltnCo(0)
                .build();
    }

    public TradeAreaDetailResponseDto findTradeAreaDetail(int trdarCd) {
        // 상권 자체가 존재하는지(마스터)만 검증. 존재하지 않으면 에러.
        Record2<Integer, String> region = dsl
                .select(TRADE_AREA_REGION.TRDAR_CD, TRADE_AREA_REGION.TRDAR_CD_NM)
                .from(TRADE_AREA_REGION)
                .where(TRADE_AREA_REGION.TRDAR_CD.eq(trdarCd))
                .limit(1)
                .fetchOne();

        if (region == null) {
            throw new BaseException(BaseResponseStatus.INVALID_TRDAR_CD);
        }

        final String trdarCdNm = nz(region.value2());

        // ====== TRADE_AREA_TRDAR_CHNGE_IX ======
        TradeAreaTrdarChngeIxDto chngeDto = defaultChnge();
        Record3<Integer, String, String> chnge = dsl
                .select(
                        TRADE_AREA_TRDAR_CHNGE_IX.TRDAR_CD,
                        TRADE_AREA_TRDAR_CHNGE_IX.STDR_YYQU_CD,
                        TRADE_AREA_TRDAR_CHNGE_IX.TRDAR_CHNGE_IX
                )
                .from(TRADE_AREA_TRDAR_CHNGE_IX)
                .where(TRADE_AREA_TRDAR_CHNGE_IX.TRDAR_CD.eq(trdarCd))
                .orderBy(TRADE_AREA_TRDAR_CHNGE_IX.STDR_YYQU_CD.desc())
                .limit(1)
                .fetchOne();
        if (chnge != null) {
            chngeDto = TradeAreaTrdarChngeIxDto.builder()
                    .stdrYyquCd(nz(chnge.value2()))
                    .trdrChngeIx(nz(chnge.value3()))
                    .build();
        }

        // ====== TRADE_AREA_SALES_CD ======
        TradeAreaSalesDto salesDto = defaultSales();
        Record8<Integer, String, ULong, UInteger, ULong, ULong, UInteger, UInteger> sales = dsl
                .select(
                        TRADE_AREA_SALES_CD.TRDAR_CD,
                        TRADE_AREA_SALES_CD.STDR_YYQU_CD,
                        TRADE_AREA_SALES_CD.THSMON_SELNG_AMT,
                        TRADE_AREA_SALES_CD.THSMON_SELNG_CO,
                        TRADE_AREA_SALES_CD.MDWK_SELNG_AMT,
                        TRADE_AREA_SALES_CD.WKEND_SELNG_AMT,
                        TRADE_AREA_SALES_CD.MDWK_SELNG_CO,
                        TRADE_AREA_SALES_CD.WKEND_SELNG_CO
                )
                .from(TRADE_AREA_SALES_CD)
                .where(TRADE_AREA_SALES_CD.TRDAR_CD.eq(trdarCd))
                .orderBy(TRADE_AREA_SALES_CD.STDR_YYQU_CD.desc())
                .limit(1)
                .fetchOne();
        if (sales != null) {
            salesDto = TradeAreaSalesDto.builder()
                    .stdrYyquCd(nz(sales.value2()))
                    .thsmonSelngAmt(toLong(sales.value3()))
                    .thsmonSelngCo(toInteger(sales.value4()))
                    .mdwkSelngAmt(toLong(sales.value5()))
                    .wkendSelngAmt(toLong(sales.value6()))
                    .mdwkSelngCo(toInteger(sales.value7()))
                    .wkendSelngCo(toInteger(sales.value8()))
                    .build();
        }

        // ====== TRADE_AREA_STOR_CD ======
        TradeAreaStorDto storDto = defaultStor();
        Record8<Integer, String, UInteger, UInteger, BigDecimal, UInteger, BigDecimal, UInteger> stor = dsl
                .select(
                        TRADE_AREA_STOR_CD.TRDAR_CD,
                        TRADE_AREA_STOR_CD.STDR_YYQU_CD,
                        TRADE_AREA_STOR_CD.STOR_CO,
                        TRADE_AREA_STOR_CD.FRC_STOR_CO,
                        TRADE_AREA_STOR_CD.OPBIZ_RT,
                        TRADE_AREA_STOR_CD.OPBIZ_STOR_CO,
                        TRADE_AREA_STOR_CD.CLSBIZ_RT,
                        TRADE_AREA_STOR_CD.CLSBIZ_STOR_CO
                )
                .from(TRADE_AREA_STOR_CD)
                .where(TRADE_AREA_STOR_CD.TRDAR_CD.eq(trdarCd))
                .orderBy(TRADE_AREA_STOR_CD.STDR_YYQU_CD.desc())
                .limit(1)
                .fetchOne();
        if (stor != null) {
            storDto = TradeAreaStorDto.builder()
                    .stdrYyquCd(nz(stor.value2()))
                    .storCo(toInteger(stor.value3()))
                    .frcStorCo(toInteger(stor.value4()))
                    .opbizRt(toBigDecimal(stor.value5()))
                    .opbizStorCo(toInteger(stor.value6()))
                    .clsbizRt(toBigDecimal(stor.value7()))
                    .clsbizStorCo(toInteger(stor.value8()))
                    .build();
        }

        // ====== TRADE_AREA_FLPOP_CD (주의: 컬럼 타입이 UInteger) ======
        TradeAreaFlpopDto flpopDto = defaultFlpop();
        Record3<UInteger, UInteger, UInteger> flpop = dsl
                .select(
                        TRADE_AREA_FLPOP_CD.TRDAR_CD,
                        TRADE_AREA_FLPOP_CD.STDR_YYQU_CD,
                        TRADE_AREA_FLPOP_CD.TOT_FLPOP_CO
                )
                .from(TRADE_AREA_FLPOP_CD)
                .where(TRADE_AREA_FLPOP_CD.TRDAR_CD.eq(UInteger.valueOf(trdarCd)))
                .orderBy(TRADE_AREA_FLPOP_CD.STDR_YYQU_CD.desc())
                .limit(1)
                .fetchOne();
        if (flpop != null) {
            flpopDto = TradeAreaFlpopDto.builder()
                    .stdrYyquCd(nz(flpop.value2()))
                    .totFlpopCo(toInteger(flpop.value3()))
                    .build();
        }

        // ====== TRADE_AREA_REPOP_CD ======
        TradeAreaRepopDto repopDto = defaultRepop();
        Record3<Integer, String, UInteger> repop = dsl
                .select(
                        TRADE_AREA_REPOP_CD.TRDAR_CD,
                        TRADE_AREA_REPOP_CD.STDR_YYQU_CD,
                        TRADE_AREA_REPOP_CD.TOT_REPOP_CO
                )
                .from(TRADE_AREA_REPOP_CD)
                .where(TRADE_AREA_REPOP_CD.TRDAR_CD.eq(trdarCd))
                .orderBy(TRADE_AREA_REPOP_CD.STDR_YYQU_CD.desc())
                .limit(1)
                .fetchOne();
        if (repop != null) {
            repopDto = TradeAreaRepopDto.builder()
                    .stdrYyquCd(nz(repop.value2()))
                    .totRepopCo(toInteger(repop.value3()))
                    .build();
        }

        // ====== TRADE_AREA_WRC_POPLTN_CD ======
        TradeAreaWrcPopltnDto wrcDto = defaultWrc();
        Record3<Integer, String, UInteger> wrc = dsl
                .select(
                        TRADE_AREA_WRC_POPLTN_CD.TRDAR_CD,
                        TRADE_AREA_WRC_POPLTN_CD.STDR_YYQU_CD,
                        TRADE_AREA_WRC_POPLTN_CD.TOT_WRC_POPLTN_CO
                )
                .from(TRADE_AREA_WRC_POPLTN_CD)
                .where(TRADE_AREA_WRC_POPLTN_CD.TRDAR_CD.eq(trdarCd))
                .orderBy(TRADE_AREA_WRC_POPLTN_CD.STDR_YYQU_CD.desc())
                .limit(1)
                .fetchOne();
        if (wrc != null) {
            wrcDto = TradeAreaWrcPopltnDto.builder()
                    .stdrYyquCd(nz(wrc.value2()))
                    .totWrcPopltnCo(toInteger(wrc.value3()))
                    .build();
        }

        return TradeAreaDetailResponseDto.builder()
                .trdarCd(trdarCd)
                .trdarCdNm(trdarCdNm)
                .chnge(chngeDto)
                .sales(salesDto)
                .stor(storDto)
                .flpop(flpopDto)
                .repop(repopDto)
                .wrc(wrcDto)
                .build();
    }
}
