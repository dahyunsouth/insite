package com.ssafy.insite.ai.config;

import com.ssafy.insite.ai.dto.response.GmsChatResponseDto;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

@Component
@RequiredArgsConstructor
public class GmsClient {
    private final WebClient webClient;

    @Value("${gms.api-key}")
    private String apiKey;

    @Value("${gms.base-url}")
    private String baseUrl;

    public GmsChatResponseDto requestSummary(String prompt) {
        String url = baseUrl + "/chat/completions";

        return webClient.post()
                .uri(url)
                .header("Authorization", "Bearer " + apiKey)
                .header("Content-Type", "application/json")
                .bodyValue(buildRequestBody(prompt))
                .retrieve()
                .bodyToMono(GmsChatResponseDto.class)
                .block();
    }

    private Map<String, Object> buildRequestBody(String prompt) {
        Map<String, Object> body = new HashMap<>();
        body.put("model", "gpt-4.1-nano");
        body.put("max_tokens", 512);
        body.put("temperature", 0.3);

        List<Map<String, String>> messages = new ArrayList<>();
        messages.add(Map.of("role", "system", "content", "Answer in Korean."
                + "내가 보내준 특정 상권의 이름과 정보를 바탕으로 상권 데이터를 요약하고, "
                + "주요 특징을 주요 특징을 3~4개 항목으로 bullet point로 작성해줘. "
                + "상권 요약에서는 해당 상권의 분위기나 특징들을 포함해야 해. "));
        messages.add(Map.of("role", "user", "content", prompt));

        body.put("messages", messages);

        return body;
    }
}
