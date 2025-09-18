package com.ssafy.insite.data.service;

import com.ssafy.insite.data.dto.response.QuarterSummaryResponseDto;
import com.ssafy.insite.data.dto.response.SeoulDistrictCountResponseDto;
import com.ssafy.insite.data.dto.response.SeoulDongCountResponseDto;
import com.ssafy.insite.data.dto.response.TradeAreaDetailResponseDto;
import com.ssafy.insite.data.dto.response.TradeAreasResponseDto;
import com.ssafy.insite.data.enums.SeoulDistrict;
import java.util.List;

public interface DataService {
    // 자치구 목록 조회
    List<String> getDistriceList();
    
    // 행정동 목록 조회
    List<String> getDongList(SeoulDistrict district);
    
    // 자치구별 상권 개수 조회
    SeoulDistrictCountResponseDto countByDistrict(SeoulDistrict district);
    
    // 행정동별 상권 개수 조회
    SeoulDongCountResponseDto countByDong(SeoulDistrict district, String dong);
    
    // 상권 분기 요약 조회
    QuarterSummaryResponseDto findQuarterSummary(String stdrYyquCd, Integer trdarCd);

    // 상권 상세 정보 조회
    TradeAreaDetailResponseDto findTradeAreaDetail(int trdarCd);

    // 최신 분기 조회
    String findLatestQuarterCode();

    // 행정동 내 상권 리스트 조회
    TradeAreasResponseDto listByDistrictAndDong(SeoulDistrict district, String dong);
}
