package com.ssafy.insite.data.service;

import com.ssafy.insite.data.dto.response.SeoulDistrictCountResponseDto;
import com.ssafy.insite.data.enums.SeoulDistrict;
import com.ssafy.insite.data.repository.TradeAreaRegionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class DataServiceImpl implements DataService {
    private final TradeAreaRegionRepository tradeAreaRegionRepository;

    // 자치구별 상권 개수 조회
    @Override
    @Transactional(readOnly = true)
    public SeoulDistrictCountResponseDto countByDistrict(SeoulDistrict district) {
        return tradeAreaRegionRepository.countByDistrict(district);
    }
}
