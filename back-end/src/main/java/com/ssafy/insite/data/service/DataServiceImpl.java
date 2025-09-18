package com.ssafy.insite.data.service;

import com.ssafy.insite.data.dto.response.QuarterSummaryResponseDto;
import com.ssafy.insite.data.dto.response.SeoulDistrictCountResponseDto;
import com.ssafy.insite.data.dto.response.SeoulDongCountResponseDto;
import com.ssafy.insite.data.dto.response.TradeAreasResponseDto;
import com.ssafy.insite.data.enums.SeoulDistrict;
import com.ssafy.insite.data.repository.TradeAreaRegionRepository;
import com.ssafy.insite.data.repository.TradeAreaStorCdRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class DataServiceImpl implements DataService {
    private final TradeAreaRegionRepository tradeAreaRegionRepository;
    private final TradeAreaStorCdRepository tradeAreaStorCdRepository;

    // 자치구별 상권 개수 조회
    @Override
    @Transactional(readOnly = true)
    public SeoulDistrictCountResponseDto countByDistrict(SeoulDistrict district) {
        return tradeAreaRegionRepository.countByDistrict(district);
    }

    // 행정동별 상권 개수 조회
    @Override
    @Transactional(readOnly = true)
    public SeoulDongCountResponseDto countByDong(SeoulDistrict district, String dong) {
        return tradeAreaRegionRepository.countByDong(district, dong);
    }

    // 상권별 분기 요약 조회
    @Override
    @Transactional(readOnly = true)
    public QuarterSummaryResponseDto findQuarterSummary(String stdrYyquCd, Integer trdarCd) {
        return tradeAreaStorCdRepository.findQuarterSummary(stdrYyquCd, trdarCd);
    }

    // 최신 분기 조회
    @Override
    @Transactional(readOnly = true)
    public String findLatestQuarterCode() {
        return tradeAreaStorCdRepository.findLatestQuarterCode();
    }

    // 행정동 내 상권 리스트 조회
    @Override
    @Transactional(readOnly = true)
    public TradeAreasResponseDto listByDistrictAndDong(SeoulDistrict district, String dong) {
        return tradeAreaRegionRepository.listByDistrictAndDong(district, dong);
    }
}
