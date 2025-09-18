package com.ssafy.insite.data.dto.response;

import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@AllArgsConstructor
@Builder
public class TradeAreaItemDto {
    private String trdarSeCd;       // 상권_구분_코드
    private String trdarSeCdNm;     // 상권_구분_코드_명
    private int trdarCd;         // 상권_코드
    private String trdarCdNm;       // 상권_코드_명
    private double xcntsValue;      // 엑스좌표_값(중심점)
    private double ydntsValue;      // 와이좌표_값(중심점)
    private BigDecimal relmAr;      // 영역_면적
}
