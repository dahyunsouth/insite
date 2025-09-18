package com.ssafy.insite.common.utils;

import com.ssafy.insite.data.enums.TradeAreaType;
import java.util.Map;
import java.util.Optional;
import org.springframework.core.convert.converter.Converter;
import org.springframework.stereotype.Component;

@Component
public class TradeAreaTypeConverter implements Converter<String, TradeAreaType> {
    @Override
    public TradeAreaType convert(String source) {
        // 한글 라벨 우선 매칭, 실패하면 Enum 이름으로 매칭
        return fromKorean(source)
                .orElseGet(() -> TradeAreaType.valueOf(source));
    }

    // 한글 라벨 매핑
    private static final Map<TradeAreaType, String> KOREAN_LABELS = Map.ofEntries(
            Map.entry(TradeAreaType.AREA_TYPE_A, "골목"),
            Map.entry(TradeAreaType.AREA_TYPE_D, "발달")
    );

    public static String toKorean(TradeAreaType t) {
        return KOREAN_LABELS.get(t);
    }

    public static Optional<TradeAreaType> fromKorean(String label) {
        if (label == null) return Optional.empty();
        return KOREAN_LABELS.entrySet().stream()
                .filter(e -> e.getValue().equals(label))
                .map(Map.Entry::getKey)
                .findFirst();
    }
}
