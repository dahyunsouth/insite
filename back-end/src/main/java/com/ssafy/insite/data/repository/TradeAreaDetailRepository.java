package com.ssafy.insite.data.repository;

import static com.ssafy.insite.data.jooq.codegen.Tables.TRADE_AREA_REGION;
import static com.ssafy.insite.data.jooq.codegen.Tables.TRADE_AREA_TRDAR_CHNGE_IX;
import static com.ssafy.insite.data.jooq.codegen.Tables.TRADE_AREA_SALES_CD;
import static com.ssafy.insite.data.jooq.codegen.Tables.TRADE_AREA_STOR_CD;
import static com.ssafy.insite.data.jooq.codegen.Tables.TRADE_AREA_FLPOP_CD;
import static com.ssafy.insite.data.jooq.codegen.Tables.TRADE_AREA_REPOP_CD;
import static com.ssafy.insite.data.jooq.codegen.Tables.TRADE_AREA_WRC_POPLTN_CD;

import com.ssafy.insite.common.dto.response.BaseResponseStatus;
import com.ssafy.insite.common.exception.BaseException;
import com.ssafy.insite.data.dto.response.TradeAreaDetailResponseDto;
import com.ssafy.insite.data.dto.response.TradeAreaDetailResponseDto.TradeAreaFlpopDto;
import com.ssafy.insite.data.dto.response.TradeAreaDetailResponseDto.TradeAreaRepopDto;
import com.ssafy.insite.data.dto.response.TradeAreaDetailResponseDto.TradeAreaSalesDto;
import com.ssafy.insite.data.dto.response.TradeAreaDetailResponseDto.TradeAreaStorDto;
import com.ssafy.insite.data.dto.response.TradeAreaDetailResponseDto.TradeAreaTrdarChngeIxDto;
import com.ssafy.insite.data.dto.response.TradeAreaDetailResponseDto.TradeAreaWrcPopltnDto;
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

    private static Integer toInteger(UInteger v) {
        return v == null ? null : v.intValue();
    }

    // 상권 상세 정보 조회
    public TradeAreaDetailResponseDto findTradeAreaDetail(int trdarCd) {
        // 상권코드(trdarCd)와 일치하는 상권 존재 여부 확인
        Record2<Integer, String> region = dsl
                .select(TRADE_AREA_REGION.TRDAR_CD, TRADE_AREA_REGION.TRDAR_CD_NM)
                .from(TRADE_AREA_REGION)
                .where(TRADE_AREA_REGION.TRDAR_CD.eq(trdarCd))
                .limit(1)
                .fetchOne();

        if (region == null) {
            throw new BaseException(BaseResponseStatus.INVALID_TRDAR_CD);
        }

        String trdarCdNm = region.value2(); // 상권 코드명

        // TRADE_AREA_TRDAR_CHNGE_IX
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

        // TRADE_AREA_SALES_CD
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

        // TRADE_AREA_STOR_CD
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

        // TRADE_AREA_FLPOP_CD
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

        // TRADE_AREA_REPOP_CD
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

        // TRADE_AREA_WRC_POPLTN_CD
        Record3<Integer, String, UInteger> wrc = dsl
                .select(
                        TRADE_AREA_WRC_POPLTN_CD.TRDAR_CD,
                        TRADE_AREA_WRC_POPLTN_CD.STDR_YYQU_CD,
                        TRADE_AREA_WRC_POPLTN_CD.TOT_WRC_POPLTN_CO
                )
                .from(TRADE_AREA_WRC_POPLTN_CD)
                .orderBy(TRADE_AREA_WRC_POPLTN_CD.STDR_YYQU_CD.desc())
                .limit(1)
                .fetchOne();

        return TradeAreaDetailResponseDto.builder()
                .trdarCd(trdarCd)
                .trdarCdNm(trdarCdNm)
                .chnge(
                        TradeAreaTrdarChngeIxDto.builder()
                                .stdrYyquCd(chnge.value2())
                                .trdrChngeIx(chnge.value3())
                                .build()
                )
                .sales(
                        TradeAreaSalesDto.builder()
                                .stdrYyquCd(sales.value2())
                                .thsmonSelngAmt(sales.value3())
                                .thsmonSelngCo(sales.value4())
                                .mdwkSelngAmt(sales.value5())
                                .wkendSelngAmt(sales.value6())
                                .mdwkSelngCo(sales.value7())
                                .wkendSelngCo(sales.value8())
                                .build()
                )
                .stor(
                        TradeAreaStorDto.builder()
                                .stdrYyquCd(stor.value2())
                                .storCo(stor.value3())
                                .frcStorCo(stor.value4())
                                .opbizRt(stor.value5())
                                .opbizStorCo(stor.value6())
                                .clsbizRt(stor.value7())
                                .clsbizStorCo(stor.value8())
                                .build()
                )
                .flpop(
                        TradeAreaFlpopDto.builder()
                                .stdrYyquCd(flpop.value2())
                                .totFlpopCo(flpop.value3())
                                .build()
                )
                .repop(
                        TradeAreaRepopDto.builder()
                                .stdrYyquCd(repop.value2())
                                .totRepopCo(repop.value3())
                                .build()
                )
                .wrc(
                        TradeAreaWrcPopltnDto.builder()
                                .stdrYyquCd(wrc.value2())
                                .totWrcPopltnCo(wrc.value3())
                                .build()
                )
                .build();
    }
}
