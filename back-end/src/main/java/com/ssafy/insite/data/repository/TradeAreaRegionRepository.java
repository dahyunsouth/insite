package com.ssafy.insite.data.repository;

import static com.ssafy.insite.data.jooq.codegen.Tables.TRADE_AREA_REGION;

import com.ssafy.insite.common.dto.response.BaseResponseStatus;
import com.ssafy.insite.common.exception.BaseException;
import com.ssafy.insite.common.utils.SeoulDistrictConverter;
import com.ssafy.insite.common.utils.SeoulDongCatalog;
import com.ssafy.insite.data.dto.response.SeoulDistrictCountResponseDto;
import com.ssafy.insite.data.dto.response.SeoulDongCountResponseDto;
import com.ssafy.insite.data.dto.response.TradeAreaItemDto;
import com.ssafy.insite.data.dto.response.TradeAreasResponseDto;
import com.ssafy.insite.data.enums.SeoulDistrict;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.jooq.DSLContext;
import org.jooq.Record1;
import org.jooq.impl.DSL;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class TradeAreaRegionRepository {
    private final DSLContext dsl;

    // 자치구별 상권 개수 조회
    public SeoulDistrictCountResponseDto countByDistrict(SeoulDistrict district) {
        String gu = SeoulDistrictConverter.toKorean(district); // 국문 행정구명

        Record1<Integer> record = dsl
                .select(DSL.count())
                .from(TRADE_AREA_REGION)
                .where(TRADE_AREA_REGION.SIGNGU_CD_NM.eq(gu))
                .fetchOne();

        if (record == null) {
            throw new BaseException(BaseResponseStatus.INVALID_QUERY);
        }

        int count = record.value1();

        return new SeoulDistrictCountResponseDto(gu, count);
    }

    // 행정동별 상권 개수 조회
    public SeoulDongCountResponseDto countByDong(SeoulDistrict district, String dong) {
        String gu = SeoulDistrictConverter.toKorean(district); // 국문 행정구명

        if (!SeoulDongCatalog.isValid(district, dong)) {
            throw new BaseException(BaseResponseStatus.INVALID_DONG);
        }

        Record1<Integer> record = dsl
                .select(DSL.count())
                .from(TRADE_AREA_REGION)
                .where(TRADE_AREA_REGION.SIGNGU_CD_NM.eq(gu))
                .and(TRADE_AREA_REGION.ADSTRD_CD_NM.eq(SeoulDongCatalog.normalize(dong)))
                .fetchOne();

        if (record == null) {
            throw new BaseException(BaseResponseStatus.INVALID_QUERY);
        }

        int count = record.value1();

        return new SeoulDongCountResponseDto(gu, dong, count);
    }

    // 행정동 내 상권 리스트 조회
    public TradeAreasResponseDto listByDistrictAndDong(SeoulDistrict district, String dong) {
        String gu = SeoulDistrictConverter.toKorean(district); // 국문 행정구명

        if (!SeoulDongCatalog.isValid(district, dong)) {
            throw new BaseException(BaseResponseStatus.INVALID_DONG);
        }

        List<TradeAreaItemDto> areas = dsl
                .select(
                        TRADE_AREA_REGION.TRDAR_SE_CD,
                        TRADE_AREA_REGION.TRDAR_SE_CD_NM,
                        TRADE_AREA_REGION.TRDAR_CD,
                        TRADE_AREA_REGION.TRDAR_CD_NM,
                        TRADE_AREA_REGION.XCNTS_VALUE,
                        TRADE_AREA_REGION.YDNTS_VALUE,
                        TRADE_AREA_REGION.RELM_AR
                )
                .from(TRADE_AREA_REGION)
                .where(
                        TRADE_AREA_REGION.SIGNGU_CD_NM.eq(gu)
                                .and(TRADE_AREA_REGION.ADSTRD_CD_NM.eq(dong))
                )
                .fetch(record -> new TradeAreaItemDto(
                        record.get(TRADE_AREA_REGION.TRDAR_SE_CD),
                        record.get(TRADE_AREA_REGION.TRDAR_SE_CD_NM),
                        record.get(TRADE_AREA_REGION.TRDAR_CD),
                        record.get(TRADE_AREA_REGION.TRDAR_CD_NM),
                        record.get(TRADE_AREA_REGION.XCNTS_VALUE),
                        record.get(TRADE_AREA_REGION.YDNTS_VALUE),
                        record.get(TRADE_AREA_REGION.RELM_AR)
                ));

        return TradeAreasResponseDto.builder()
                .districtNameKor(gu)
                .dongNameKor(dong)
                .areas(areas)
                .build();
    }
}
