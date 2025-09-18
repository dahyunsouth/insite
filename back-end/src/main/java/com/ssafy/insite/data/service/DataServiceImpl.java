package com.ssafy.insite.data.service;

import com.ssafy.insite.common.utils.SeoulDistrictConverter;
import com.ssafy.insite.common.utils.SeoulDongCatalog;
import com.ssafy.insite.data.dto.response.QuarterSummaryResponseDto;
import com.ssafy.insite.data.dto.response.RecommendationResponseDto;
import com.ssafy.insite.data.dto.response.SeoulDistrictCountResponseDto;
import com.ssafy.insite.data.dto.response.SeoulDongCountResponseDto;
import com.ssafy.insite.data.dto.response.TradeAreaDetailResponseDto;
import com.ssafy.insite.data.dto.response.TradeAreasResponseDto;
import com.ssafy.insite.data.enums.SeoulDistrict;
import com.ssafy.insite.data.enums.TradeAreaType;
import com.ssafy.insite.data.repository.RecommendationRepository;
import com.ssafy.insite.data.repository.TradeAreaDetailRepository;
import com.ssafy.insite.data.repository.TradeAreaRegionRepository;
import com.ssafy.insite.data.repository.TradeAreaStorCdRepository;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class DataServiceImpl implements DataService {
    private final TradeAreaRegionRepository tradeAreaRegionRepository;
    private final TradeAreaStorCdRepository tradeAreaStorCdRepository;
    private final TradeAreaDetailRepository tradeAreaDetailRepository;
    private final RecommendationRepository recommendationRepository;

    // 자치구 목록 조회
    @Override
    public List<String> getDistriceList() {
        return Arrays.stream(SeoulDistrict.values())
                .map(SeoulDistrictConverter::toKorean)
                .sorted()
                .collect(Collectors.toList());
    }

    // 행정동 목록 조회
    @Override
    public List<String> getDongList(SeoulDistrict district) {
        return SeoulDongCatalog.list(district).stream()
                .map(name -> name.replace("?", "·"))
                .sorted()
                .collect(Collectors.toList());
    }

    // 상권 추천 결과 조회
    @Override
    @Transactional(readOnly = true)
    public RecommendationResponseDto findTop3ByDistrictAndType(SeoulDistrict district, TradeAreaType type) {
        return recommendationRepository.findTop3ByDistrictAndType(district, type);
    }

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

    // 상권 분기 요약 조회
    @Override
    @Transactional(readOnly = true)
    public QuarterSummaryResponseDto findQuarterSummary(String stdrYyquCd, Integer trdarCd) {
        return tradeAreaStorCdRepository.findQuarterSummary(stdrYyquCd, trdarCd);
    }

    // 상권 상세 정보 조회
    @Override
    @Transactional(readOnly = true)
    public TradeAreaDetailResponseDto findTradeAreaDetail(int trdarCd) {
        return tradeAreaDetailRepository.findTradeAreaDetail(trdarCd);
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
