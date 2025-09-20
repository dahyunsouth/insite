package com.ssafy.insite.data.repository;

import static com.ssafy.insite.data.jooq.codegen.tables.TradeAreaTrdarChngeIx.TRADE_AREA_TRDAR_CHNGE_IX;

import com.ssafy.insite.common.dto.response.BaseResponseStatus;
import com.ssafy.insite.common.exception.BaseException;
import com.ssafy.insite.data.dto.response.TradeAreaChngeIxInfoResponseDto;
import lombok.RequiredArgsConstructor;
import org.jooq.DSLContext;
import org.jooq.Record;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class TradeAreaChngeIxRepository {
    private final DSLContext dsl;

    private static Double toDouble(Number n) {
        return n == null ? null : n.doubleValue();
    }

    // 상권변화지표 정보 조회
    public TradeAreaChngeIxInfoResponseDto findChngeIxInfoByCode(int trdarCd) {
        Record record = dsl.selectFrom(TRADE_AREA_TRDAR_CHNGE_IX)
                .where(TRADE_AREA_TRDAR_CHNGE_IX.TRDAR_CD.eq(trdarCd))
                .orderBy(TRADE_AREA_TRDAR_CHNGE_IX.STDR_YYQU_CD.desc())
                .limit(1)
                .fetchOne();

        if (record == null) {
            throw new BaseException(BaseResponseStatus.INVALID_TRDAR_CD);
        }

        return TradeAreaChngeIxInfoResponseDto.builder()
                .stdrYyquCd(record.get(TRADE_AREA_TRDAR_CHNGE_IX.STDR_YYQU_CD))
                .trdarSeCd(record.get(TRADE_AREA_TRDAR_CHNGE_IX.TRDAR_SE_CD))
                .trdarSeCdNm(record.get(TRADE_AREA_TRDAR_CHNGE_IX.TRDAR_SE_CD_NM))
                .trdarCd(record.get(TRADE_AREA_TRDAR_CHNGE_IX.TRDAR_CD))
                .trdarCdNm(record.get(TRADE_AREA_TRDAR_CHNGE_IX.TRDAR_CD_NM))

                .trdarChngeIx(record.get(TRADE_AREA_TRDAR_CHNGE_IX.TRDAR_CHNGE_IX))
                .trdarChngeIxNm(record.get(TRADE_AREA_TRDAR_CHNGE_IX.TRDAR_CHNGE_IX_NM))

                .oprSaleMtAvrg(toDouble(record.get(TRADE_AREA_TRDAR_CHNGE_IX.OPR_SALE_MT_AVRG)))
                .clsSaleMtAvrg(toDouble(record.get(TRADE_AREA_TRDAR_CHNGE_IX.CLS_SALE_MT_AVRG)))
                .suOprSaleMtAvrg(toDouble(record.get(TRADE_AREA_TRDAR_CHNGE_IX.SU_OPR_SALE_MT_AVRG)))
                .suClsSaleMtAvrg(toDouble(record.get(TRADE_AREA_TRDAR_CHNGE_IX.SU_CLS_SALE_MT_AVRG)))
                .build();
    }
}
