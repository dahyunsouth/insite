package com.ssafy.insite.data.repository;

import static com.ssafy.insite.data.jooq.codegen.tables.Recommendations.RECOMMENDATIONS;

import com.ssafy.insite.common.dto.response.BaseResponseStatus;
import com.ssafy.insite.common.exception.BaseException;
import com.ssafy.insite.common.utils.SeoulDistrictConverter;
import com.ssafy.insite.common.utils.TradeAreaTypeConverter;
import com.ssafy.insite.data.dto.response.RecommendationItemDto;
import com.ssafy.insite.data.dto.response.RecommendationResponseDto;
import com.ssafy.insite.data.dto.response.TradeAreaScoreResponseDto;
import com.ssafy.insite.data.enums.SeoulDistrict;
import com.ssafy.insite.data.enums.TradeAreaType;
import java.math.BigDecimal;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.jooq.DSLContext;
import org.jooq.Record10;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class RecommendationRepository {
    private final DSLContext dsl;

    // 상권 추천 결과 조회
    public RecommendationResponseDto findTop3ByDistrictAndType(SeoulDistrict district, TradeAreaType type) {
        String districtKor = SeoulDistrictConverter.toKorean(district); // 자치구
        String typeKor = TradeAreaTypeConverter.toKorean(type); // 상권분류

        List<RecommendationItemDto> items = dsl
                .select(
                        RECOMMENDATIONS.RANKING,
                        RECOMMENDATIONS.AREA_NAME,
                        RECOMMENDATIONS.TOTAL_SCORE,
                        RECOMMENDATIONS.SUSTAINABILITY_SCORE,
                        RECOMMENDATIONS.PROFITABILITY_SCORE,
                        RECOMMENDATIONS.ACCESSIBILITY_SCORE,
                        RECOMMENDATIONS.RISK_SCORE,
                        RECOMMENDATIONS.COMPETITION_SCORE
                )
                .from(RECOMMENDATIONS)
                .where(
                        RECOMMENDATIONS.DISTRICT.eq(districtKor)
                        .and(RECOMMENDATIONS.AREA_TYPE.eq(typeKor))
                )
                .orderBy(RECOMMENDATIONS.RANKING.asc())
                .limit(3)
                .fetch(record -> RecommendationItemDto.builder()
                        .ranking(record.get(RECOMMENDATIONS.RANKING))
                        .areaName(record.get(RECOMMENDATIONS.AREA_NAME))
                        .totalScore(record.get(RECOMMENDATIONS.TOTAL_SCORE))
                        .sustainabilityScore(record.get(RECOMMENDATIONS.SUSTAINABILITY_SCORE))
                        .profitabilityScore(record.get(RECOMMENDATIONS.PROFITABILITY_SCORE))
                        .accessibilityScore(record.get(RECOMMENDATIONS.ACCESSIBILITY_SCORE))
                        .riskScore(record.get(RECOMMENDATIONS.RISK_SCORE))
                        .competitionScore(record.get(RECOMMENDATIONS.COMPETITION_SCORE))
                        .build()
                );

        return RecommendationResponseDto.builder()
                .district(districtKor)
                .areaType(typeKor)
                .items(items)
                .build();
    }

    // 상권 추천 점수 조회
    public TradeAreaScoreResponseDto findTradeAreaScore(String tradeAreaName) {
        Record10<String, String, String, String, BigDecimal, BigDecimal, BigDecimal, BigDecimal, BigDecimal, BigDecimal> record = dsl
                .select(
                        RECOMMENDATIONS.DISTRICT,
                        RECOMMENDATIONS.ADMINISTRATIVE_DONG,
                        RECOMMENDATIONS.AREA_NAME,
                        RECOMMENDATIONS.AREA_TYPE,
                        RECOMMENDATIONS.TOTAL_SCORE,
                        RECOMMENDATIONS.SUSTAINABILITY_SCORE,
                        RECOMMENDATIONS.PROFITABILITY_SCORE,
                        RECOMMENDATIONS.ACCESSIBILITY_SCORE,
                        RECOMMENDATIONS.RISK_SCORE,
                        RECOMMENDATIONS.COMPETITION_SCORE
                )
                .from(RECOMMENDATIONS)
                .where(RECOMMENDATIONS.AREA_NAME.like("%" + tradeAreaName + "%"))
                .limit(1)
                .fetchOne();

        if (record == null) {
            throw new BaseException(BaseResponseStatus.INVALID_TRDAR_CD_NM);
        }

        return TradeAreaScoreResponseDto.builder()
                .district(record.value1())
                .dong(record.value2())
                .areaName(record.value3())
                .areaType(record.value4())
                .totalScore(record.value5())
                .sustainabilityScore(record.value6())
                .profitabilityScore(record.value7())
                .accessibilityScore(record.value8())
                .riskScore(record.value9())
                .competitionScore(record.value10())
                .build();
    }
}
