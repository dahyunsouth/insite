package com.ssafy.insite.data.dto.response;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@AllArgsConstructor
@Builder
public class RecommendationResponseDto {
    private String district;   // 요청 자치구
    private String areaType;   // 요청 상권 유형
    private List<RecommendationItemDto> items;
}
