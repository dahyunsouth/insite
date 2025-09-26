package com.ssafy.insite.ai.service;

import com.ssafy.insite.ai.config.GmsClient;
import com.ssafy.insite.ai.dto.response.GmsChatResponseDto;
import com.ssafy.insite.ai.dto.response.TradeAreaSummaryResponseDto;
import com.ssafy.insite.data.dto.response.TradeAreaDetailResponseDto;
import com.ssafy.insite.data.repository.TradeAreaDetailRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
// @Primary
public class TradeAreaSummaryServiceRTImpl implements TradeAreaSummaryService {
    private final GmsClient gmsClient;
    private final TradeAreaDetailRepository tradeAreaDetailRepository;

    // 상권 요약 AI 호출
    @Override
    public TradeAreaSummaryResponseDto getTradeAreaSummary(int trdarCd) {
        TradeAreaDetailResponseDto detail = tradeAreaDetailRepository.findTradeAreaDetail(trdarCd);

        // 프롬프트 생성
        String prompt = buildPrompt(detail);

        // GMS 호출
        GmsChatResponseDto gmsResponse = gmsClient.requestSummary(prompt);

        String content = gmsResponse.getChoices().get(0).getMessage().getContent();

        // 줄 단위 분리
        List<String> lines = Arrays.stream(content.split("\n"))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());

        // 첫 줄은 summary
        String summary = lines.get(0);

        // 나머지 줄 중 "-"로 시작하는 것만 features
        List<String> features = lines.stream()
                .filter(line -> line.startsWith("-"))
                .map(line -> line.substring(1).trim())
                .collect(Collectors.toList());

        return new TradeAreaSummaryResponseDto(summary, features);
    }
    
    private String buildPrompt(TradeAreaDetailResponseDto detail) {
        return String.format(
                "다음은 상권 상세 데이터야. 이를 바탕으로 짧은 요약 1문장과 주요 특징 3~4개를 bullet point로 작성해줘.\n\n" +
                        "- 상권명: %s\n" +
                        "- 최근 분기 매출액: %s원, 건수: %s건\n" +
                        "- 주중 매출액: %s원, 주말 매출액: %s원\n" +
                        "- 점포 수: %s개, 개업률: %s, 폐업률: %s\n" +
                        "- 유동인구: %s명\n" +
                        "- 상주인구: %s명\n" +
                        "- 직장인구: %s명",
                detail.getTrdarCdNm(),
                detail.getSales().getThsmonSelngAmt(), detail.getSales().getThsmonSelngCo(),
                detail.getSales().getMdwkSelngAmt(), detail.getSales().getWkendSelngAmt(),
                detail.getStor().getStorCo(), detail.getStor().getOpbizRt(), detail.getStor().getClsbizRt(),
                detail.getFlpop().getTotFlpopCo(),
                detail.getRepop().getTotRepopCo(),
                detail.getWrc().getTotWrcPopltnCo()
        );
    }
}
