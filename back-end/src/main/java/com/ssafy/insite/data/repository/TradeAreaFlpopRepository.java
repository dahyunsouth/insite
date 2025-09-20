package com.ssafy.insite.data.repository;

import static com.ssafy.insite.data.jooq.codegen.tables.TradeAreaFlpopCd.TRADE_AREA_FLPOP_CD;

import com.ssafy.insite.common.dto.response.BaseResponseStatus;
import com.ssafy.insite.common.exception.BaseException;
import com.ssafy.insite.data.dto.response.TradeAreaFlpopInfoResponseDto;
import lombok.RequiredArgsConstructor;
import org.jooq.DSLContext;
import org.jooq.Record;
import org.jooq.types.UInteger;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class TradeAreaFlpopRepository {
    private final DSLContext dsl;

    private static Integer toInteger(UInteger v) {
        return v == null ? null : v.intValue();
    }

    // 상권별 유동인구 정보 조회
    public TradeAreaFlpopInfoResponseDto findFlpopInfoByCode(int trdarCd) {
        Record record = dsl.selectFrom(TRADE_AREA_FLPOP_CD)
                .where(TRADE_AREA_FLPOP_CD.TRDAR_CD.eq(UInteger.valueOf(trdarCd)))
                .orderBy(TRADE_AREA_FLPOP_CD.STDR_YYQU_CD.desc())
                .limit(1)
                .fetchOne();

        if (record == null) {
            throw new BaseException(BaseResponseStatus.INVALID_TRDAR_CD);
        }

        return TradeAreaFlpopInfoResponseDto.builder()
                .stdrYyquCd(toInteger(record.get(TRADE_AREA_FLPOP_CD.STDR_YYQU_CD)))
                .trdarSeCd(record.get(TRADE_AREA_FLPOP_CD.TRDAR_SE_CD))
                .trdarSeCdNm(record.get(TRADE_AREA_FLPOP_CD.TRDAR_SE_CD_NM))
                .trdarCd(toInteger(record.get(TRADE_AREA_FLPOP_CD.TRDAR_CD)))
                .trdarCdNm(record.get(TRADE_AREA_FLPOP_CD.TRDAR_CD_NM))

                .totFlpopCo(toInteger(record.get(TRADE_AREA_FLPOP_CD.TOT_FLPOP_CO)))
                .mlFlpopCo(toInteger(record.get(TRADE_AREA_FLPOP_CD.ML_FLPOP_CO)))
                .fmlFlpopCo(toInteger(record.get(TRADE_AREA_FLPOP_CD.FML_FLPOP_CO)))
                .agrde10FlpopCo(toInteger(record.get(TRADE_AREA_FLPOP_CD.AGRDE_10_FLPOP_CO)))
                .agrde20FlpopCo(toInteger(record.get(TRADE_AREA_FLPOP_CD.AGRDE_20_FLPOP_CO)))
                .agrde30FlpopCo(toInteger(record.get(TRADE_AREA_FLPOP_CD.AGRDE_30_FLPOP_CO)))
                .agrde40FlpopCo(toInteger(record.get(TRADE_AREA_FLPOP_CD.AGRDE_40_FLPOP_CO)))
                .agrde50FlpopCo(toInteger(record.get(TRADE_AREA_FLPOP_CD.AGRDE_50_FLPOP_CO)))
                .agrde60AboveFlpopCo(toInteger(record.get(TRADE_AREA_FLPOP_CD.AGRDE_60_ABOVE_FLPOP_CO)))

                .tmzon0006FlpopCo(toInteger(record.get(TRADE_AREA_FLPOP_CD.TMZON_00_06_FLPOP_CO)))
                .tmzon0611FlpopCo(toInteger(record.get(TRADE_AREA_FLPOP_CD.TMZON_06_11_FLPOP_CO)))
                .tmzon1114FlpopCo(toInteger(record.get(TRADE_AREA_FLPOP_CD.TMZON_11_14_FLPOP_CO)))
                .tmzon1417FlpopCo(toInteger(record.get(TRADE_AREA_FLPOP_CD.TMZON_14_17_FLPOP_CO)))
                .tmzon1721FlpopCo(toInteger(record.get(TRADE_AREA_FLPOP_CD.TMZON_17_21_FLPOP_CO)))
                .tmzon2124FlpopCo(toInteger(record.get(TRADE_AREA_FLPOP_CD.TMZON_21_24_FLPOP_CO)))

                .monFlpopCo(toInteger(record.get(TRADE_AREA_FLPOP_CD.MON_FLPOP_CO)))
                .tuesFlpopCo(toInteger(record.get(TRADE_AREA_FLPOP_CD.TUES_FLPOP_CO)))
                .wedFlpopCo(toInteger(record.get(TRADE_AREA_FLPOP_CD.WED_FLPOP_CO)))
                .thurFlpopCo(toInteger(record.get(TRADE_AREA_FLPOP_CD.THUR_FLPOP_CO)))
                .friFlpopCo(toInteger(record.get(TRADE_AREA_FLPOP_CD.FRI_FLPOP_CO)))
                .satFlpopCo(toInteger(record.get(TRADE_AREA_FLPOP_CD.SAT_FLPOP_CO)))
                .sunFlpopCo(toInteger(record.get(TRADE_AREA_FLPOP_CD.SUN_FLPOP_CO)))
                .build();
    }
}
