package com.ssafy.insite.ai.batch;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.insite.ai.dto.response.TradeAreaSummaryResponseDto;
import com.ssafy.insite.ai.entity.TradeAreaSummary;
import com.ssafy.insite.ai.service.TradeAreaSummaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.batch.item.ItemProcessor;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class TradeAreaSummaryProcessor implements ItemProcessor<Integer, TradeAreaSummary> {
    @Qualifier("tradeAreaSummaryServiceRTImpl")
    private final TradeAreaSummaryService tradeAreaSummaryService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public TradeAreaSummary process(Integer trdarCd) throws Exception {
        // GPT 호출
        TradeAreaSummaryResponseDto dto = tradeAreaSummaryService.getTradeAreaSummary(trdarCd);

        // features를 JSON 문자열로 직렬화
        String featuresJson = objectMapper.writeValueAsString(dto.getFeatures());

        // DB에 저장할 엔티티 반환
        return TradeAreaSummary.builder()
                .trdarCd(trdarCd)
                .summary(dto.getSummary())
                .features(featuresJson)
                .build();
    }
}
