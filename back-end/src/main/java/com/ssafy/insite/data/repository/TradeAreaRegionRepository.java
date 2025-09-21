package com.ssafy.insite.data.repository;

import static com.ssafy.insite.data.jooq.codegen.Tables.TRADE_AREA_REGION;
import static com.ssafy.insite.data.jooq.codegen.Tables.TRADE_AREA_STOR_CD;
import static org.jooq.impl.DSL.max;

import com.ssafy.insite.common.dto.response.BaseResponseStatus;
import com.ssafy.insite.common.exception.BaseException;
import com.ssafy.insite.common.utils.SeoulDistrictConverter;
import com.ssafy.insite.common.utils.SeoulDongCatalog;
import com.ssafy.insite.data.dto.response.SeoulDistrictCountResponseDto;
import com.ssafy.insite.data.dto.response.SeoulDongCountResponseDto;
import com.ssafy.insite.data.dto.response.TradeAreaItemDto;
import com.ssafy.insite.data.dto.response.TradeAreasResponseDto;
import com.ssafy.insite.data.enums.SeoulDistrict;
import com.ssafy.insite.data.jooq.codegen.tables.TradeAreaRegion;
import com.ssafy.insite.data.jooq.codegen.tables.TradeAreaStorCd;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.jooq.DSLContext;
import org.jooq.Field;
import org.jooq.Record1;
import org.jooq.Table;
import org.jooq.impl.DSL;
import org.jooq.types.UInteger;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class TradeAreaRegionRepository {
    private final DSLContext dsl;
    private final String induty = "커피-음료";

    private static Integer toInteger(UInteger v) {
        return v == null ? null : v.intValue();
    }

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

        // 최신분기만 가진 파생테이블
        Table<?> latest = dsl
                .select(
                        TRADE_AREA_STOR_CD.TRDAR_CD,
                        TRADE_AREA_STOR_CD.SVC_INDUTY_CD_NM,
                        TRADE_AREA_STOR_CD.STOR_CO,
                        TRADE_AREA_STOR_CD.SIMILR_INDUTY_STOR_CO,
                        DSL.rowNumber().over() // 윈도우 함수()
                                .partitionBy(TRADE_AREA_STOR_CD.TRDAR_CD, TRADE_AREA_STOR_CD.SVC_INDUTY_CD_NM)
                                .orderBy(TRADE_AREA_STOR_CD.STDR_YYQU_CD.desc())
                                .as("rn")
                )
                .from(TRADE_AREA_STOR_CD)
                .where(TRADE_AREA_STOR_CD.SVC_INDUTY_CD_NM.eq(induty))
                .asTable("latest");

        // 파생테이블 컬럼 핸들
        Field<Integer>  L_TRDAR_CD  = latest.field("TRDAR_CD", Integer.class);
        Field<Integer>  L_RN        = latest.field("rn", Integer.class);
        Field<UInteger> L_STOR_CO   = latest.field("STOR_CO", UInteger.class);
        Field<UInteger> L_SIMILR_CO = latest.field("SIMILR_INDUTY_STOR_CO", UInteger.class);

        // 메인 조회
        List<TradeAreaItemDto> areas = dsl
                .select(
                        TRADE_AREA_REGION.TRDAR_SE_CD,
                        TRADE_AREA_REGION.TRDAR_SE_CD_NM,
                        TRADE_AREA_REGION.TRDAR_CD,
                        TRADE_AREA_REGION.TRDAR_CD_NM,
                        TRADE_AREA_REGION.XCNTS_VALUE,
                        TRADE_AREA_REGION.YDNTS_VALUE,
                        TRADE_AREA_REGION.RELM_AR,
                        L_STOR_CO,
                        L_SIMILR_CO
                )
                .from(TRADE_AREA_REGION)
                .leftJoin(latest)
                .on(TRADE_AREA_REGION.TRDAR_CD.eq(L_TRDAR_CD))
                .and(L_RN.eq(DSL.inline(1))) // 최신 분기만 조인
                .where(
                        TRADE_AREA_REGION.SIGNGU_CD_NM.eq(gu)
                                .and(TRADE_AREA_REGION.ADSTRD_CD_NM.eq(dong))
                )
                .fetch(rec -> new TradeAreaItemDto(
                        rec.get(TRADE_AREA_REGION.TRDAR_SE_CD),
                        rec.get(TRADE_AREA_REGION.TRDAR_SE_CD_NM),
                        rec.get(TRADE_AREA_REGION.TRDAR_CD),
                        rec.get(TRADE_AREA_REGION.TRDAR_CD_NM),
                        rec.get(TRADE_AREA_REGION.XCNTS_VALUE),
                        rec.get(TRADE_AREA_REGION.YDNTS_VALUE),
                        rec.get(TRADE_AREA_REGION.RELM_AR),
                        toInteger(rec.get(L_STOR_CO)),
                        toInteger(rec.get(L_SIMILR_CO))
                ));
        
        /*
        필요한 인덱스
        
        -- 행정동으로 빠르게 찾고, 곧바로 조인키(TRDAR_CD)까지 커버
        CREATE INDEX ix_region_gu_dong_trdar
        ON trade_area_region (signgu_cd_nm, adstrd_cd_nm, trdar_cd);

        -- 동등조건(=) 컬럼을 선두로, 최신분기 선택 컬럼을 마지막에 배치
        CREATE INDEX ix_stor_trdar_svc_yyqu
        ON trade_area_stor_cd (trdar_cd, svc_induty_cd_nm, stdr_yyqu_cd);

        -- 최신 분기 1행에서 바로 값까지 읽도록 커버링(인덱스 커짐)
        CREATE INDEX ix_stor_trdar_svc_yyqu_cover
        ON trade_area_stor_cd (
        trdar_cd, svc_induty_cd_nm, stdr_yyqu_cd,
        stor_co, similr_induty_stor_co
        );
         */

        return TradeAreasResponseDto.builder()
                .districtNameKor(gu)
                .dongNameKor(dong)
                .areas(areas)
                .build();
    }
}
