package com.ssafy.insite.data.service;

import com.ssafy.insite.data.dto.response.SeoulDistrictCountResponseDto;
import com.ssafy.insite.data.dto.response.SeoulDongCountResponseDto;
import com.ssafy.insite.data.enums.SeoulDistrict;

public interface DataService {
    // 자치구별 상권 개수 조회
    SeoulDistrictCountResponseDto countByDistrict(SeoulDistrict district);
    
    // 행정동별 상권 개수 조회
    SeoulDongCountResponseDto countByDong(SeoulDistrict district, String dong);
}
