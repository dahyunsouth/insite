package com.ssafy.insite.data.repository;

import static com.ssafy.insite.data.jooq.codegen.tables.TradeAreaStorCd.TRADE_AREA_STOR_CD;

import com.ssafy.insite.common.dto.response.BaseResponseStatus;
import com.ssafy.insite.common.exception.BaseException;
import com.ssafy.insite.data.dto.response.QuarterSummaryResponseDto;
import java.math.BigDecimal;
import lombok.RequiredArgsConstructor;
import org.jooq.DSLContext;
import org.jooq.Record6;
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

    // 상권 분기 요약 조회
    public QuarterSummaryResponseDto findQuarterSummary(String stdrYyquCd, Integer trdarCd) {
        Record6<UInteger, UInteger, BigDecimal, UInteger, BigDecimal, UInteger> record =
                dsl.select(
                                TRADE_AREA_STOR_CD.STOR_CO,                 // 점포_수
                                TRADE_AREA_STOR_CD.SIMILR_INDUTY_STOR_CO,   // 유사_업종_점포_수
                                TRADE_AREA_STOR_CD.OPBIZ_RT,                // 개업_율(%)
                                TRADE_AREA_STOR_CD.OPBIZ_STOR_CO,           // 개업_점포_수
                                TRADE_AREA_STOR_CD.CLSBIZ_RT,               // 폐업_률(%)
                                TRADE_AREA_STOR_CD.CLSBIZ_STOR_CO           // 폐업_점포_수
                        )
                        .from(TRADE_AREA_STOR_CD)
                        .where(TRADE_AREA_STOR_CD.STDR_YYQU_CD.eq(stdrYyquCd))
                        .and(TRADE_AREA_STOR_CD.TRDAR_CD.eq(trdarCd))
                        .and(TRADE_AREA_STOR_CD.SVC_INDUTY_CD_NM.eq("커피-음료"))
                        .fetchOne();

        if (record == null) {
            throw new BaseException(BaseResponseStatus.INVALID_QUERY);
        }

        return QuarterSummaryResponseDto.builder()
                .storCo(toInteger(record.value1()))
                .similrIndutyStorCo(toInteger(record.value2()))
                .opbizRt(toDouble(record.value3()))
                .opbizStorCo(toInteger(record.value4()))
                .clsbizRt(toDouble(record.value5()))
                .clsbizStorCo(toInteger(record.value6()))
                .netIncrease((toInteger(record.value4()) - toInteger(record.value6())))
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
