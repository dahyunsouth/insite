package com.ssafy.insite.data.repository;

import static com.ssafy.insite.data.jooq.codegen.Tables.TRADE_AREA_REGION;

import com.ssafy.insite.common.utils.SeoulDistrictConverter;
import com.ssafy.insite.data.dto.response.SeoulDistrictCountResponseDto;
import com.ssafy.insite.data.enums.SeoulDistrict;
import lombok.RequiredArgsConstructor;
import org.jooq.DSLContext;
import org.jooq.Record1;
import org.jooq.impl.DSL;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class TradeAreaRegionRepository {
    private final DSLContext dsl;

    public SeoulDistrictCountResponseDto countByDistrict(SeoulDistrict district) {
        String label = SeoulDistrictConverter.toKorean(district); // 국문 행정구명

        Record1<Integer> record = dsl
                .select(DSL.count())
                .from(TRADE_AREA_REGION)
                .where(TRADE_AREA_REGION.SIGNGU_CD_NM.eq(label))
                .fetchOne();

        int count = (record != null) ? record.value1() : 0;

        return new SeoulDistrictCountResponseDto(district, label, count);
    }
}
