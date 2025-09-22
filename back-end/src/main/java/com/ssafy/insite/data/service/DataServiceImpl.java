package com.ssafy.insite.data.service;

import com.ssafy.insite.common.utils.SeoulDistrictConverter;
import com.ssafy.insite.common.utils.SeoulDongCatalog;
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
import com.ssafy.insite.data.repository.RecommendationRepository;
import com.ssafy.insite.data.repository.TradeAreaChngeIxRepository;
import com.ssafy.insite.data.repository.TradeAreaDetailRepository;
import com.ssafy.insite.data.repository.TradeAreaFlpopRepository;
import com.ssafy.insite.data.repository.TradeAreaRegionRepository;
import com.ssafy.insite.data.repository.TradeAreaRepopRepository;
import com.ssafy.insite.data.repository.TradeAreaSalesRepository;
import com.ssafy.insite.data.repository.TradeAreaStorCdRepository;
import com.ssafy.insite.data.repository.TradeAreaWrcPopltnRepository;
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
    private final TradeAreaSalesRepository tradeAreaSalesRepository;
    private final TradeAreaWrcPopltnRepository tradeAreaWrcPopltnRepository;
    private final TradeAreaRepopRepository tradeAreaRepopRepository;
    private final TradeAreaFlpopRepository tradeAreaFlpopRepository;
    private final TradeAreaChngeIxRepository tradeAreaChngeIxRepository;

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

    // 상권 추천 점수 조회
    @Override
    @Transactional(readOnly = true)
    public TradeAreaScoreResponseDto findTradeAreaScore(String tradeAreaName) {
        return recommendationRepository.findTradeAreaScore(tradeAreaName);
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

    // 행정동 내 상권 리스트 조회 (★ 인덱싱 필수)
    @Override
    @Transactional(readOnly = true)
    public TradeAreasResponseDto listByDistrictAndDong(SeoulDistrict district, String dong) {
        return tradeAreaRegionRepository.listByDistrictAndDong(district, dong);
    }

    // 상권별 점포 정보 조회
    @Override
    @Transactional(readOnly = true)
    public TradeAreaStorInfoResponseDto findStorInfoByCode(int trdarCd) {
        return tradeAreaStorCdRepository.findStorInfoByCode(trdarCd);
    }

    // 상권별 매출 정보 조회
    @Override
    @Transactional(readOnly = true)
    public TradeAreaSalesInfoResponseDto findSalesInfoByCode(int trdarCd) {
        return tradeAreaSalesRepository.findSalesInfoByCode(trdarCd);
    }

    // 상권별 직장인구 정보 조회
    @Override
    @Transactional(readOnly = true)
    public TradeAreaWrcPopltnInfoResponseDto findWrcPopltnInfoByCode(int trdarCd) {
        return tradeAreaWrcPopltnRepository.findWrcPopltnInfoByCode(trdarCd);
    }

    // 상권별 상주인구 정보 조회
    @Override
    @Transactional(readOnly = true)
    public TradeAreaRepopInfoResponseDto findRepopInfoByCode(int trdarCd) {
        return tradeAreaRepopRepository.findRepopInfoByCode(trdarCd);
    }

    // 상권별 유동인구 정보 조회
    @Override
    @Transactional(readOnly = true)
    public TradeAreaFlpopInfoResponseDto findFlpopInfoByCode(int trdarCd) {
        return tradeAreaFlpopRepository.findFlpopInfoByCode(trdarCd);
    }

    // 상권변화지표 정보 조회
    @Override
    @Transactional(readOnly = true)
    public TradeAreaChngeIxInfoResponseDto findChngeIxInfoByCode(int trdarCd) {
        return tradeAreaChngeIxRepository.findChngeIxInfoByCode(trdarCd);
    }

    // 상권명으로 상권코드 조회
    @Override
    @Transactional(readOnly = true)
    public TradeAreaCodeResponseDto findCodeByName(String trdarCdNm) {
        return tradeAreaRegionRepository.findCodeByName(trdarCdNm);
    }
}
