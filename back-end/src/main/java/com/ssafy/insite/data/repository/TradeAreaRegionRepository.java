package com.ssafy.insite.data.repository;

import static com.ssafy.insite.data.jooq.codegen.Tables.TRADE_AREA_REGION;
import static com.ssafy.insite.data.jooq.codegen.Tables.TRADE_AREA_SALES_CD;
import static com.ssafy.insite.data.jooq.codegen.Tables.TRADE_AREA_STOR_CD;
import static org.jooq.impl.DSL.max;

import com.ssafy.insite.common.dto.response.BaseResponseStatus;
import com.ssafy.insite.common.exception.BaseException;
import com.ssafy.insite.common.utils.RedisKeyGenerator;
import com.ssafy.insite.common.utils.SeoulDistrictConverter;
import com.ssafy.insite.common.utils.SeoulDongCatalog;
import com.ssafy.insite.data.dto.response.SeoulDistrictCountResponseDto;
import com.ssafy.insite.data.dto.response.SeoulDongCountResponseDto;
import com.ssafy.insite.data.dto.response.TradeAreaCodeResponseDto;
import com.ssafy.insite.data.dto.response.TradeAreaItemDto;
import com.ssafy.insite.data.dto.response.TradeAreasResponseDto;
import com.ssafy.insite.data.enums.SeoulDistrict;
import com.ssafy.insite.data.jooq.codegen.tables.TradeAreaRegion;
import com.ssafy.insite.data.jooq.codegen.tables.TradeAreaStorCd;
import java.time.Duration;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.jooq.DSLContext;
import org.jooq.Field;
import org.jooq.Record1;
import org.jooq.Record2;
import org.jooq.Table;
import org.jooq.impl.DSL;
import org.jooq.types.UInteger;
import org.jooq.types.ULong;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class TradeAreaRegionRepository {
    private final DSLContext dsl;
    private final RedisTemplate<String, String> redisTemplate;
    private final String induty = "커피-음료";

    private static Integer toInteger(UInteger v) {
        return v == null ? 0 : v.intValue();
    }

    private static Long toLong(ULong v) {
        return v == null ? 0L : v.longValue();
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
        String latestQuarterKey = RedisKeyGenerator.generateLatestQuarterKey();

        if (!SeoulDongCatalog.isValid(district, dong)) {
            throw new BaseException(BaseResponseStatus.INVALID_DONG);
        }

        // 최신 분기 캐싱
        String cached = redisTemplate.opsForValue().get(latestQuarterKey);
        String latestYyqu;

        if (cached != null) {
            latestYyqu = cached;
        } else {
            latestYyqu = dsl
                    .select(DSL.max(TRADE_AREA_STOR_CD.STDR_YYQU_CD))
                    .from(TRADE_AREA_STOR_CD)
                    .fetchOneInto(String.class);

            if (latestYyqu == null) {
                throw new BaseException(BaseResponseStatus.INTERNAL_SERVER_ERROR);
            }

            redisTemplate.opsForValue().set(latestQuarterKey, latestYyqu, Duration.ofHours(1)); // 캐시에 저장 (TTL: 1시간)
        }

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
                        TRADE_AREA_STOR_CD.STOR_CO,
                        TRADE_AREA_STOR_CD.SIMILR_INDUTY_STOR_CO,
                        TRADE_AREA_SALES_CD.THSMON_SELNG_AMT
                )
                .from(TRADE_AREA_REGION)
                .leftJoin(TRADE_AREA_STOR_CD)
                .on(TRADE_AREA_REGION.TRDAR_CD.eq(TRADE_AREA_STOR_CD.TRDAR_CD))
                .and(TRADE_AREA_STOR_CD.SVC_INDUTY_CD_NM.eq(induty))
                .and(TRADE_AREA_STOR_CD.STDR_YYQU_CD.eq(latestYyqu)) // 최신 분기만 필터링
                .leftJoin(TRADE_AREA_SALES_CD)
                .on(TRADE_AREA_REGION.TRDAR_CD.eq(TRADE_AREA_SALES_CD.TRDAR_CD))
                .and(TRADE_AREA_SALES_CD.SVC_INDUTY_CD_NM.eq(induty))
                .and(TRADE_AREA_SALES_CD.STDR_YYQU_CD.eq(latestYyqu)) // 최신 분기만 필터링
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
                        toInteger(rec.get(TRADE_AREA_STOR_CD.STOR_CO)),
                        toInteger(rec.get(TRADE_AREA_STOR_CD.SIMILR_INDUTY_STOR_CO)),
                        toLong(rec.get(TRADE_AREA_SALES_CD.THSMON_SELNG_AMT))
                ));
        
        /*
        필요한 인덱스
        
        -- 자치구, 행정동으로 상권조회
        CREATE INDEX ix_region_gu_dong_trdar
        ON trade_area_region (signgu_cd_nm, adstrd_cd_nm, trdar_cd);

        -- 업종별 최신분기
        CREATE INDEX ix_stor_trdar_svc_yyqu
        ON trade_area_stor_cd (trdar_cd, svc_induty_cd_nm, stdr_yyqu_cd);

        -- (커버링 인덱스) 최신분기 및 점포 수를 인덱스만으로 조회
        CREATE INDEX ix_stor_trdar_svc_yyqu_cover
        ON trade_area_stor_cd (
        trdar_cd, svc_induty_cd_nm, stdr_yyqu_cd,
        stor_co, similr_induty_stor_co);

        -- 최신분기 + 업종별 조회
        CREATE INDEX ix_sales_trdar_svc_qu_cover
        ON trade_area_sales_cd (trdar_cd, svc_induty_cd_nm, stdr_yyqu_cd, thsmon_selng_amt);
         */

        return TradeAreasResponseDto.builder()
                .districtNameKor(gu)
                .dongNameKor(dong)
                .areas(areas)
                .build();
    }

    // 상권명으로 상권코드 조회
    public TradeAreaCodeResponseDto findCodeByName(String trdarCdNm) {
        // 요청값의 특수문자('·', '.', ',')를 DB에 저장된 ?와 일치시키기 위해 치환
        String normalized = trdarCdNm.replaceAll("[·.,]", "?");

        Record2<Integer, String> record = dsl
                .select(
                        TRADE_AREA_REGION.TRDAR_CD,
                        TRADE_AREA_REGION.TRDAR_CD_NM
                )
                .from(TRADE_AREA_REGION)
                .where(TRADE_AREA_REGION.TRDAR_CD_NM.eq(normalized))
                .fetchOne();

        if (record == null) {
            throw new BaseException(BaseResponseStatus.INVALID_TRDAR_CD_NM);
        }

        return TradeAreaCodeResponseDto.builder()
                .trdarCd(record.value1())
                .trdarCdNm(record.value2())
                .build();
    }
    
    // 상권코드 목록 조회
    public List<Integer> findAllTrdarCd() {
        return dsl.select(TRADE_AREA_REGION.TRDAR_CD)
                .from(TRADE_AREA_REGION)
                .fetchInto(Integer.class);
    }
}
