package com.ssafy.insite.data.service;

import com.ssafy.insite.data.dto.response.RecommendationResponseDto;
import com.ssafy.insite.data.dto.response.SeoulDistrictCountResponseDto;
import com.ssafy.insite.data.dto.response.SeoulDongCountResponseDto;
import com.ssafy.insite.data.dto.response.TradeAreaChngeIxInfoResponseDto;
import com.ssafy.insite.data.dto.response.TradeAreaCodeResponseDto;
import com.ssafy.insite.data.dto.response.TradeAreaDetailResponseDto;
import com.ssafy.insite.data.dto.response.TradeAreaFlpopInfoResponseDto;
import com.ssafy.insite.data.dto.response.TradeAreaRepopInfoResponseDto;
import com.ssafy.insite.data.dto.response.TradeAreaSalesInfoResponseDto;
import com.ssafy.insite.data.dto.response.TradeAreaScoreResponseDto;
import com.ssafy.insite.data.dto.response.TradeAreaStorInfoResponseDto;
import com.ssafy.insite.data.dto.response.TradeAreaWrcPopltnInfoResponseDto;
import com.ssafy.insite.data.dto.response.TradeAreasResponseDto;
import com.ssafy.insite.data.enums.SeoulDistrict;
import com.ssafy.insite.data.enums.TradeAreaType;
import java.util.List;

public interface DataService {
    // 자치구 목록 조회
    List<String> getDistriceList();
    
    // 행정동 목록 조회
    List<String> getDongList(SeoulDistrict district);

    // 상권 추천 결과 조회
    RecommendationResponseDto findTop3ByDistrictAndType(SeoulDistrict district, TradeAreaType type);

    // 상권 추천 점수 조회
    TradeAreaScoreResponseDto findTradeAreaScore(String tradeAreaName);
    
    // 자치구별 상권 개수 조회
    SeoulDistrictCountResponseDto countByDistrict(SeoulDistrict district);
    
    // 행정동별 상권 개수 조회
    SeoulDongCountResponseDto countByDong(SeoulDistrict district, String dong);

    // 상권 상세 정보 조회
    TradeAreaDetailResponseDto findTradeAreaDetail(int trdarCd);

    // 최신 분기 조회
    String findLatestQuarterCode();

    // 행정동 내 상권 리스트 조회 (★ 인덱싱 필수)
    TradeAreasResponseDto listByDistrictAndDong(SeoulDistrict district, String dong);

    // 상권별 점포 정보 조회
    TradeAreaStorInfoResponseDto findStorInfoByCode(int trdarCd);

    // 상권별 매출 정보 조회
    TradeAreaSalesInfoResponseDto findSalesInfoByCode(int trdarCd);

    // 상권별 직장인구 정보 조회
    TradeAreaWrcPopltnInfoResponseDto findWrcPopltnInfoByCode(int trdarCd);

    // 상권별 상주인구 정보 조회
    TradeAreaRepopInfoResponseDto findRepopInfoByCode(int trdarCd);

    // 상권별 유동인구 정보 조회
    TradeAreaFlpopInfoResponseDto findFlpopInfoByCode(int trdarCd);

    // 상권변화지표 정보 조회
    TradeAreaChngeIxInfoResponseDto findChngeIxInfoByCode(int trdarCd);

    // 상권명으로 상권코드 조회
    TradeAreaCodeResponseDto findCodeByName(String trdarCdNm);
}
