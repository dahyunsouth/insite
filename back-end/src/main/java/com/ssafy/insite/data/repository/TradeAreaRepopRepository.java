package com.ssafy.insite.data.repository;

import static com.ssafy.insite.data.jooq.codegen.tables.TradeAreaRepopCd.TRADE_AREA_REPOP_CD;

import com.ssafy.insite.common.dto.response.BaseResponseStatus;
import com.ssafy.insite.common.exception.BaseException;
import com.ssafy.insite.data.dto.response.TradeAreaRepopInfoResponseDto;
import lombok.RequiredArgsConstructor;
import org.jooq.DSLContext;
import org.jooq.Record;
import org.jooq.types.UInteger;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class TradeAreaRepopRepository {
    private final DSLContext dsl;

    private static Integer toInteger(UInteger v) {
        return v == null ? null : v.intValue();
    }

    // 상권별 상주인구 정보 조회
    public TradeAreaRepopInfoResponseDto findRepopInfoByCode(int trdarCd) {
        Record record = dsl.selectFrom(TRADE_AREA_REPOP_CD)
                .where(TRADE_AREA_REPOP_CD.TRDAR_CD.eq(trdarCd))
                .orderBy(TRADE_AREA_REPOP_CD.STDR_YYQU_CD.desc())
                .limit(1)
                .fetchOne();

        if (record == null) {
            throw new BaseException(BaseResponseStatus.INVALID_TRDAR_CD);
        }

        return TradeAreaRepopInfoResponseDto.builder()
                .stdrYyquCd(record.get(TRADE_AREA_REPOP_CD.STDR_YYQU_CD))
                .trdarSeCd(record.get(TRADE_AREA_REPOP_CD.TRDAR_SE_CD))
                .trdarSeCdNm(record.get(TRADE_AREA_REPOP_CD.TRDAR_SE_CD_NM))
                .trdarCd(record.get(TRADE_AREA_REPOP_CD.TRDAR_CD))
                .trdarCdNm(record.get(TRADE_AREA_REPOP_CD.TRDAR_CD_NM))

                .totRepopCo(toInteger(record.get(TRADE_AREA_REPOP_CD.TOT_REPOP_CO)))
                .mlRepopCo(toInteger(record.get(TRADE_AREA_REPOP_CD.ML_REPOP_CO)))
                .fmlRepopCo(toInteger(record.get(TRADE_AREA_REPOP_CD.FML_REPOP_CO)))
                .agrde10RepopCo(toInteger(record.get(TRADE_AREA_REPOP_CD.AGRDE_10_REPOP_CO)))
                .agrde20RepopCo(toInteger(record.get(TRADE_AREA_REPOP_CD.AGRDE_20_REPOP_CO)))
                .agrde30RepopCo(toInteger(record.get(TRADE_AREA_REPOP_CD.AGRDE_30_REPOP_CO)))
                .agrde40RepopCo(toInteger(record.get(TRADE_AREA_REPOP_CD.AGRDE_40_REPOP_CO)))
                .agrde50RepopCo(toInteger(record.get(TRADE_AREA_REPOP_CD.AGRDE_50_REPOP_CO)))
                .agrde60AboveRepopCo(toInteger(record.get(TRADE_AREA_REPOP_CD.AGRDE_60_ABOVE_REPOP_CO)))

                .mag10RepopCo(toInteger(record.get(TRADE_AREA_REPOP_CD.MAG_10_REPOP_CO)))
                .mag20RepopCo(toInteger(record.get(TRADE_AREA_REPOP_CD.MAG_20_REPOP_CO)))
                .mag30RepopCo(toInteger(record.get(TRADE_AREA_REPOP_CD.MAG_30_REPOP_CO)))
                .mag40RepopCo(toInteger(record.get(TRADE_AREA_REPOP_CD.MAG_40_REPOP_CO)))
                .mag50RepopCo(toInteger(record.get(TRADE_AREA_REPOP_CD.MAG_50_REPOP_CO)))
                .mag60AboveRepopCo(toInteger(record.get(TRADE_AREA_REPOP_CD.MAG_60_ABOVE_REPOP_CO)))

                .fag10RepopCo(toInteger(record.get(TRADE_AREA_REPOP_CD.FAG_10_REPOP_CO)))
                .fag20RepopCo(toInteger(record.get(TRADE_AREA_REPOP_CD.FAG_20_REPOP_CO)))
                .fag30RepopCo(toInteger(record.get(TRADE_AREA_REPOP_CD.FAG_30_REPOP_CO)))
                .fag40RepopCo(toInteger(record.get(TRADE_AREA_REPOP_CD.FAG_40_REPOP_CO)))
                .fag50RepopCo(toInteger(record.get(TRADE_AREA_REPOP_CD.FAG_50_REPOP_CO)))
                .fag60AboveRepopCo(toInteger(record.get(TRADE_AREA_REPOP_CD.FAG_60_ABOVE_REPOP_CO)))

                .totHshldCo(toInteger(record.get(TRADE_AREA_REPOP_CD.TOT_HSHLD_CO)))
                .aptHshldCo(toInteger(record.get(TRADE_AREA_REPOP_CD.APT_HSHLD_CO)))
                .nonAptHshldCo(toInteger(record.get(TRADE_AREA_REPOP_CD.NON_APT_HSHLD_CO)))
                .build();
    }
}
