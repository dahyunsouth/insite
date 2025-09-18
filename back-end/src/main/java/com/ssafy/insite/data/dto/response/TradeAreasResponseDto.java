package com.ssafy.insite.data.dto.response;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@AllArgsConstructor
@Builder
public class TradeAreasResponseDto {
    private String districtNameKor; // 국문 행정구명
    private String dongNameKor; // 국문 행정동명
    private List<TradeAreaItemDto> areas;
}
