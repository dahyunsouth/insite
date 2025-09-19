package com.ssafy.insite.data.repository;

import static com.ssafy.insite.data.jooq.codegen.tables.TradeAreaSalesCd.TRADE_AREA_SALES_CD;

import com.ssafy.insite.common.dto.response.BaseResponseStatus;
import com.ssafy.insite.common.exception.BaseException;
import com.ssafy.insite.data.dto.response.TradeAreaSalesInfoResponseDto;
import lombok.RequiredArgsConstructor;
import org.jooq.DSLContext;
import org.jooq.Record;
import org.jooq.types.UInteger;
import org.jooq.types.ULong;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class TradeAreaSalesRepository {
    private final DSLContext dsl;

    // 상권별 매출 정보 조회
    public TradeAreaSalesInfoResponseDto findSalesInfoByCode(int trdarCd) {
        Record record = dsl.selectFrom(TRADE_AREA_SALES_CD)
                .where(TRADE_AREA_SALES_CD.TRDAR_CD.eq(trdarCd)
                        .and(TRADE_AREA_SALES_CD.SVC_INDUTY_CD_NM.eq("커피-음료")))
                .orderBy(TRADE_AREA_SALES_CD.STDR_YYQU_CD.desc())
                .limit(1)
                .fetchOne();

        if (record == null) {
            throw new BaseException(BaseResponseStatus.INVALID_TRDAR_CD);
        }

        return TradeAreaSalesInfoResponseDto.builder()
                // 기본 식별
                .stdrYyquCd(record.get(TRADE_AREA_SALES_CD.STDR_YYQU_CD))
                .trdarSeCd(record.get(TRADE_AREA_SALES_CD.TRDAR_SE_CD))
                .trdarSeCdNm(record.get(TRADE_AREA_SALES_CD.TRDAR_SE_CD_NM))
                .trdarCd(record.get(TRADE_AREA_SALES_CD.TRDAR_CD))
                .trdarCdNm(record.get(TRADE_AREA_SALES_CD.TRDAR_CD_NM))
                .svcIndutyCd(record.get(TRADE_AREA_SALES_CD.SVC_INDUTY_CD))
                .svcIndutyCdNm(record.get(TRADE_AREA_SALES_CD.SVC_INDUTY_CD_NM))

                // 매출 금액
                .thsmonSelngAmt(uLong(record.get(TRADE_AREA_SALES_CD.THSMON_SELNG_AMT)))
                .mdwkSelngAmt(uLong(record.get(TRADE_AREA_SALES_CD.MDWK_SELNG_AMT)))
                .wkendSelngAmt(uLong(record.get(TRADE_AREA_SALES_CD.WKEND_SELNG_AMT)))
                .monSelngAmt(uLong(record.get(TRADE_AREA_SALES_CD.MON_SELNG_AMT)))
                .tuesSelngAmt(uLong(record.get(TRADE_AREA_SALES_CD.TUES_SELNG_AMT)))
                .wedSelngAmt(uLong(record.get(TRADE_AREA_SALES_CD.WED_SELNG_AMT)))
                .thurSelngAmt(uLong(record.get(TRADE_AREA_SALES_CD.THUR_SELNG_AMT)))
                .friSelngAmt(uLong(record.get(TRADE_AREA_SALES_CD.FRI_SELNG_AMT)))
                .satSelngAmt(uLong(record.get(TRADE_AREA_SALES_CD.SAT_SELNG_AMT)))
                .sunSelngAmt(uLong(record.get(TRADE_AREA_SALES_CD.SUN_SELNG_AMT)))
                .tmzon0006SelngAmt(uLong(record.get(TRADE_AREA_SALES_CD.TMZON_00_06_SELNG_AMT)))
                .tmzon0611SelngAmt(uLong(record.get(TRADE_AREA_SALES_CD.TMZON_06_11_SELNG_AMT)))
                .tmzon1114SelngAmt(uLong(record.get(TRADE_AREA_SALES_CD.TMZON_11_14_SELNG_AMT)))
                .tmzon1417SelngAmt(uLong(record.get(TRADE_AREA_SALES_CD.TMZON_14_17_SELNG_AMT)))
                .tmzon1721SelngAmt(uLong(record.get(TRADE_AREA_SALES_CD.TMZON_17_21_SELNG_AMT)))
                .tmzon2124SelngAmt(uLong(record.get(TRADE_AREA_SALES_CD.TMZON_21_24_SELNG_AMT)))
                .mlSelngAmt(uLong(record.get(TRADE_AREA_SALES_CD.ML_SELNG_AMT)))
                .fmlSelngAmt(uLong(record.get(TRADE_AREA_SALES_CD.FML_SELNG_AMT)))
                .agrde10SelngAmt(uLong(record.get(TRADE_AREA_SALES_CD.AGRDE_10_SELNG_AMT)))
                .agrde20SelngAmt(uLong(record.get(TRADE_AREA_SALES_CD.AGRDE_20_SELNG_AMT)))
                .agrde30SelngAmt(uLong(record.get(TRADE_AREA_SALES_CD.AGRDE_30_SELNG_AMT)))
                .agrde40SelngAmt(uLong(record.get(TRADE_AREA_SALES_CD.AGRDE_40_SELNG_AMT)))
                .agrde50SelngAmt(uLong(record.get(TRADE_AREA_SALES_CD.AGRDE_50_SELNG_AMT)))
                .agrde60AboveSelngAmt(uLong(record.get(TRADE_AREA_SALES_CD.AGRDE_60_ABOVE_SELNG_AMT)))

                // 매출 건수
                .thsmonSelngCo(uInt(record.get(TRADE_AREA_SALES_CD.THSMON_SELNG_CO)))
                .mdwkSelngCo(uInt(record.get(TRADE_AREA_SALES_CD.MDWK_SELNG_CO)))
                .wkendSelngCo(uInt(record.get(TRADE_AREA_SALES_CD.WKEND_SELNG_CO)))
                .monSelngCo(uInt(record.get(TRADE_AREA_SALES_CD.MON_SELNG_CO)))
                .tuesSelngCo(uInt(record.get(TRADE_AREA_SALES_CD.TUES_SELNG_CO)))
                .wedSelngCo(uInt(record.get(TRADE_AREA_SALES_CD.WED_SELNG_CO)))
                .thurSelngCo(uInt(record.get(TRADE_AREA_SALES_CD.THUR_SELNG_CO)))
                .friSelngCo(uInt(record.get(TRADE_AREA_SALES_CD.FRI_SELNG_CO)))
                .satSelngCo(uInt(record.get(TRADE_AREA_SALES_CD.SAT_SELNG_CO)))
                .sunSelngCo(uInt(record.get(TRADE_AREA_SALES_CD.SUN_SELNG_CO)))
                .tmzon0006SelngCo(uInt(record.get(TRADE_AREA_SALES_CD.TMZON_00_06_SELNG_CO)))
                .tmzon0611SelngCo(uInt(record.get(TRADE_AREA_SALES_CD.TMZON_06_11_SELNG_CO)))
                .tmzon1114SelngCo(uInt(record.get(TRADE_AREA_SALES_CD.TMZON_11_14_SELNG_CO)))
                .tmzon1417SelngCo(uInt(record.get(TRADE_AREA_SALES_CD.TMZON_14_17_SELNG_CO)))
                .tmzon1721SelngCo(uInt(record.get(TRADE_AREA_SALES_CD.TMZON_17_21_SELNG_CO)))
                .tmzon2124SelngCo(uInt(record.get(TRADE_AREA_SALES_CD.TMZON_21_24_SELNG_CO)))
                .mlSelngCo(uInt(record.get(TRADE_AREA_SALES_CD.ML_SELNG_CO)))
                .fmlSelngCo(uInt(record.get(TRADE_AREA_SALES_CD.FML_SELNG_CO)))
                .agrde10SelngCo(uInt(record.get(TRADE_AREA_SALES_CD.AGRDE_10_SELNG_CO)))
                .agrde20SelngCo(uInt(record.get(TRADE_AREA_SALES_CD.AGRDE_20_SELNG_CO)))
                .agrde30SelngCo(uInt(record.get(TRADE_AREA_SALES_CD.AGRDE_30_SELNG_CO)))
                .agrde40SelngCo(uInt(record.get(TRADE_AREA_SALES_CD.AGRDE_40_SELNG_CO)))
                .agrde50SelngCo(uInt(record.get(TRADE_AREA_SALES_CD.AGRDE_50_SELNG_CO)))
                .agrde60AboveSelngCo(uInt(record.get(TRADE_AREA_SALES_CD.AGRDE_60_ABOVE_SELNG_CO)))
                .build();
    }

    private static Long uLong(ULong v) {
        return v == null ? null : v.longValue();
    }

    private static Integer uInt(UInteger v) {
        return v == null ? null : v.intValue();
    }
}
