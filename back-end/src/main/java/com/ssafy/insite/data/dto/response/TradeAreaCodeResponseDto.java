package com.ssafy.insite.data.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@AllArgsConstructor
@Builder
public class TradeAreaCodeResponseDto {
    private String trdarCdNm;
    private Integer trdarCd;
}
