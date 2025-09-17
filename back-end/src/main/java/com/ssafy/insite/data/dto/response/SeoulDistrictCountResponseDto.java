package com.ssafy.insite.data.dto.response;

import com.ssafy.insite.data.enums.SeoulDistrict;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@AllArgsConstructor
@Builder
public class SeoulDistrictCountResponseDto {
    private String districtNameKor; // 국문 행정구명
    private int count; // 상권 개수
}
