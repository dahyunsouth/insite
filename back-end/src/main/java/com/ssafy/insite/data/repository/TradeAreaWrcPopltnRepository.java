package com.ssafy.insite.data.repository;

import static com.ssafy.insite.data.jooq.codegen.tables.TradeAreaWrcPopltnCd.TRADE_AREA_WRC_POPLTN_CD;

import com.ssafy.insite.common.dto.response.BaseResponseStatus;
import com.ssafy.insite.common.exception.BaseException;
import com.ssafy.insite.data.dto.response.TradeAreaWrcPopltnInfoResponseDto;
import lombok.RequiredArgsConstructor;
import org.jooq.DSLContext;
import org.jooq.Record;
import org.jooq.types.UInteger;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class TradeAreaWrcPopltnRepository {
    private final DSLContext dsl;

    private static Integer toInteger(UInteger v) {
        return v == null ? null : v.intValue();
    }

    // 상권별 직장인구 정보 조회
    public TradeAreaWrcPopltnInfoResponseDto findWrcPopltnInfoByCode(int trdarCd) {
        Record record = dsl.selectFrom(TRADE_AREA_WRC_POPLTN_CD)
                .where(TRADE_AREA_WRC_POPLTN_CD.TRDAR_CD.eq(trdarCd))
                .orderBy(TRADE_AREA_WRC_POPLTN_CD.STDR_YYQU_CD.desc())
                .limit(1)
                .fetchOne();

        if (record == null) {
            throw new BaseException(BaseResponseStatus.INVALID_TRDAR_CD);
        }

        return TradeAreaWrcPopltnInfoResponseDto.builder()
                .stdrYyquCd(record.get(TRADE_AREA_WRC_POPLTN_CD.STDR_YYQU_CD))
                .trdarSeCd(record.get(TRADE_AREA_WRC_POPLTN_CD.TRDAR_SE_CD))
                .trdarSeCdNm(record.get(TRADE_AREA_WRC_POPLTN_CD.TRDAR_SE_CD_NM))
                .trdarCd(record.get(TRADE_AREA_WRC_POPLTN_CD.TRDAR_CD))
                .trdarCdNm(record.get(TRADE_AREA_WRC_POPLTN_CD.TRDAR_CD_NM))

                .totWrcPopltnCo(toInteger(record.get(TRADE_AREA_WRC_POPLTN_CD.TOT_WRC_POPLTN_CO)))
                .mlWrcPopltnCo(toInteger(record.get(TRADE_AREA_WRC_POPLTN_CD.ML_WRC_POPLTN_CO)))
                .fmlWrcPopltnCo(toInteger(record.get(TRADE_AREA_WRC_POPLTN_CD.FML_WRC_POPLTN_CO)))
                .agrde10WrcPopltnCo(toInteger(record.get(TRADE_AREA_WRC_POPLTN_CD.AGRDE_10_WRC_POPLTN_CO)))
                .agrde20WrcPopltnCo(toInteger(record.get(TRADE_AREA_WRC_POPLTN_CD.AGRDE_20_WRC_POPLTN_CO)))
                .agrde30WrcPopltnCo(toInteger(record.get(TRADE_AREA_WRC_POPLTN_CD.AGRDE_30_WRC_POPLTN_CO)))
                .agrde40WrcPopltnCo(toInteger(record.get(TRADE_AREA_WRC_POPLTN_CD.AGRDE_40_WRC_POPLTN_CO)))
                .agrde50WrcPopltnCo(toInteger(record.get(TRADE_AREA_WRC_POPLTN_CD.AGRDE_50_WRC_POPLTN_CO)))
                .agrde60AboveWrcPopltnCo(toInteger(record.get(TRADE_AREA_WRC_POPLTN_CD.AGRDE_60_ABOVE_WRC_POPLTN_CO)))

                .mag10WrcPopltnCo(toInteger(record.get(TRADE_AREA_WRC_POPLTN_CD.MAG_10_WRC_POPLTN_CO)))
                .mag20WrcPopltnCo(toInteger(record.get(TRADE_AREA_WRC_POPLTN_CD.MAG_20_WRC_POPLTN_CO)))
                .mag30WrcPopltnCo(toInteger(record.get(TRADE_AREA_WRC_POPLTN_CD.MAG_30_WRC_POPLTN_CO)))
                .mag40WrcPopltnCo(toInteger(record.get(TRADE_AREA_WRC_POPLTN_CD.MAG_40_WRC_POPLTN_CO)))
                .mag50WrcPopltnCo(toInteger(record.get(TRADE_AREA_WRC_POPLTN_CD.MAG_50_WRC_POPLTN_CO)))
                .mag60AboveWrcPopltnCo(toInteger(record.get(TRADE_AREA_WRC_POPLTN_CD.MAG_60_ABOVE_WRC_POPLTN_CO)))

                .fag10WrcPopltnCo(toInteger(record.get(TRADE_AREA_WRC_POPLTN_CD.FAG_10_WRC_POPLTN_CO)))
                .fag20WrcPopltnCo(toInteger(record.get(TRADE_AREA_WRC_POPLTN_CD.FAG_20_WRC_POPLTN_CO)))
                .fag30WrcPopltnCo(toInteger(record.get(TRADE_AREA_WRC_POPLTN_CD.FAG_30_WRC_POPLTN_CO)))
                .fag40WrcPopltnCo(toInteger(record.get(TRADE_AREA_WRC_POPLTN_CD.FAG_40_WRC_POPLTN_CO)))
                .fag50WrcPopltnCo(toInteger(record.get(TRADE_AREA_WRC_POPLTN_CD.FAG_50_WRC_POPLTN_CO)))
                .fag60AboveWrcPopltnCo(toInteger(record.get(TRADE_AREA_WRC_POPLTN_CD.FAG_60_ABOVE_WRC_POPLTN_CO)))
                .build();
    }
}
