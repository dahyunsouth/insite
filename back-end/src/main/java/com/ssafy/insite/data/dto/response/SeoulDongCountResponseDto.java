package com.ssafy.insite.data.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@AllArgsConstructor
@Builder
public class SeoulDongCountResponseDto {
    private String districtNameKor; // 국문 행정구명
    private String dongNameKor; // 국문 행정동명
    private int count; // 상권 개수
}
