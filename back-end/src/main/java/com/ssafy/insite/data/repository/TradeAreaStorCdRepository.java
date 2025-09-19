package com.ssafy.insite.data.repository;

import static com.ssafy.insite.data.jooq.codegen.tables.TradeAreaStorCd.TRADE_AREA_STOR_CD;

import com.ssafy.insite.common.dto.response.BaseResponseStatus;
import com.ssafy.insite.common.exception.BaseException;
import com.ssafy.insite.data.dto.response.TradeAreaScoreResponseDto;
import com.ssafy.insite.data.dto.response.TradeAreaStorInfoResponseDto;
import java.math.BigDecimal;
import lombok.RequiredArgsConstructor;
import org.jooq.DSLContext;
import org.jooq.Record12;
import org.jooq.types.UInteger;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class TradeAreaStorCdRepository {
    private final DSLContext dsl;

    private static Integer toInteger(UInteger v) {
        return v == null ? null : v.intValue();
    }

    private static Double toDouble(BigDecimal v) {
        return v != null ? v.doubleValue() : 0.0;
    }

    // 상권별 점포 정보 조회
    public TradeAreaStorInfoResponseDto findStorInfoByCode(int trdarCd) {
        Record12<String, String, String, Integer, String, UInteger, UInteger, BigDecimal, UInteger, BigDecimal, UInteger, UInteger> record =
                dsl.select(
                                TRADE_AREA_STOR_CD.STDR_YYQU_CD,
                                TRADE_AREA_STOR_CD.TRDAR_SE_CD,
                                TRADE_AREA_STOR_CD.TRDAR_SE_CD_NM,
                                TRADE_AREA_STOR_CD.TRDAR_CD,
                                TRADE_AREA_STOR_CD.TRDAR_CD_NM,
                                TRADE_AREA_STOR_CD.STOR_CO,
                                TRADE_AREA_STOR_CD.SIMILR_INDUTY_STOR_CO,
                                TRADE_AREA_STOR_CD.OPBIZ_RT,
                                TRADE_AREA_STOR_CD.OPBIZ_STOR_CO,
                                TRADE_AREA_STOR_CD.CLSBIZ_RT,
                                TRADE_AREA_STOR_CD.CLSBIZ_STOR_CO,
                                TRADE_AREA_STOR_CD.FRC_STOR_CO
                        )
                        .from(TRADE_AREA_STOR_CD)
                        .where(TRADE_AREA_STOR_CD.TRDAR_CD.eq(trdarCd))
                        .and(TRADE_AREA_STOR_CD.SVC_INDUTY_CD_NM.eq("커피-음료"))
                        .orderBy(TRADE_AREA_STOR_CD.STDR_YYQU_CD.desc())
                        .limit(1)
                        .fetchOne();

        if (record == null) {
            throw new BaseException(BaseResponseStatus.INVALID_QUERY);
        }

        return TradeAreaStorInfoResponseDto.builder()
                .stdrYyquCd(record.value1())
                .trdarSeCd(record.value2())
                .trdarSeCdNm(record.value3())
                .trdarCd(record.value4())
                .trdarCdNm(record.value5())
                .storCo(record.value6())
                .similrIndutyStorCo(record.value7())
                .opbizRt(record.value8())
                .opbizStorCo(record.value9())
                .clsbizRt(record.value10())
                .clsbizStorCo(record.value11())
                .frcStorCo(record.value12())
                .netIncrease(toInteger(record.value9()) - toInteger(record.value9()))
                .build();
    }

    // 최신 분기 조회
    public String findLatestQuarterCode() {
        return dsl.select(TRADE_AREA_STOR_CD.STDR_YYQU_CD)
                .from(TRADE_AREA_STOR_CD)
                .orderBy(TRADE_AREA_STOR_CD.STDR_YYQU_CD.desc())
                .limit(1)
                .fetchOneInto(String.class);
    }
}
