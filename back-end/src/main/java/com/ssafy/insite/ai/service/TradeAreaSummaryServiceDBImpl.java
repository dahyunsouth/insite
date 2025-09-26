package com.ssafy.insite.ai.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.insite.ai.dto.response.TradeAreaSummaryResponseDto;
import com.ssafy.insite.ai.entity.TradeAreaSummary;
import com.ssafy.insite.ai.repository.TradeAreaSummaryRepository;
import com.ssafy.insite.common.dto.response.BaseResponseStatus;
import com.ssafy.insite.common.exception.BaseException;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Primary
public class TradeAreaSummaryServiceDBImpl implements TradeAreaSummaryService {
    private final TradeAreaSummaryRepository tradeAreaSummaryRepository;
    private final ObjectMapper objectMapper;

    // 상권 요약 AI 호출
    @Override
    public TradeAreaSummaryResponseDto getTradeAreaSummary(int trdarCd) {
        TradeAreaSummary entity = tradeAreaSummaryRepository.findById(trdarCd)
                .orElseThrow(() -> new BaseException(BaseResponseStatus.SUMMARY_NOT_FOUND));

        List<String> features;
        try {
            features = objectMapper.readValue(entity.getFeatures(), new TypeReference<List<String>>() {});
        } catch (Exception e) {
            throw new RuntimeException("features JSON 파싱 실패", e);
        }

        return new TradeAreaSummaryResponseDto(entity.getSummary(), features);
    }
}
