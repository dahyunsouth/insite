package com.ssafy.insite.common.utils;

import com.ssafy.insite.data.enums.SeoulDistrict;
import java.util.Map;
import java.util.Optional;
import org.springframework.core.convert.converter.Converter;
import org.springframework.stereotype.Component;

@Component
public class SeoulDistrictConverter implements Converter<String, SeoulDistrict> {
    @Override
    public SeoulDistrict convert(String source) {
        // 한글 라벨 우선 매칭, 실패하면 Enum 이름으로 매칭
        return fromKorean(source)
                .orElseGet(() -> SeoulDistrict.valueOf(source));
    }

    private static final Map<SeoulDistrict, String> KOREAN_LABELS = Map.ofEntries(
            Map.entry(SeoulDistrict.GANGNAM_GU, "강남구"),
            Map.entry(SeoulDistrict.GANGDONG_GU, "강동구"),
            Map.entry(SeoulDistrict.GANGBUK_GU, "강북구"),
            Map.entry(SeoulDistrict.GANGSEO_GU, "강서구"),
            Map.entry(SeoulDistrict.GWANAK_GU, "관악구"),
            Map.entry(SeoulDistrict.GWANGJIN_GU, "광진구"),
            Map.entry(SeoulDistrict.GURO_GU, "구로구"),
            Map.entry(SeoulDistrict.GEUMCHEON_GU, "금천구"),
            Map.entry(SeoulDistrict.NOWON_GU, "노원구"),
            Map.entry(SeoulDistrict.DOBONG_GU, "도봉구"),
            Map.entry(SeoulDistrict.DONGDAEMUN_GU, "동대문구"),
            Map.entry(SeoulDistrict.DONGJAK_GU, "동작구"),
            Map.entry(SeoulDistrict.MAPO_GU, "마포구"),
            Map.entry(SeoulDistrict.SEODAEMUN_GU, "서대문구"),
            Map.entry(SeoulDistrict.SEOCHO_GU, "서초구"),
            Map.entry(SeoulDistrict.SEONGDONG_GU, "성동구"),
            Map.entry(SeoulDistrict.SEONGBUK_GU, "성북구"),
            Map.entry(SeoulDistrict.SONGPA_GU, "송파구"),
            Map.entry(SeoulDistrict.YANGCHEON_GU, "양천구"),
            Map.entry(SeoulDistrict.YEONGDEUNGPO_GU, "영등포구"),
            Map.entry(SeoulDistrict.YONGSAN_GU, "용산구"),
            Map.entry(SeoulDistrict.EUNPYEONG_GU, "은평구"),
            Map.entry(SeoulDistrict.JONGNO_GU, "종로구"),
            Map.entry(SeoulDistrict.JUNG_GU, "중구"),
            Map.entry(SeoulDistrict.JUNGRANG_GU, "중랑구")
    );

    public static String toKorean(SeoulDistrict d) {
        return KOREAN_LABELS.get(d);
    }

    public static Optional<SeoulDistrict> fromKorean(String label) {
        if (label == null) return Optional.empty();
        return KOREAN_LABELS.entrySet().stream()
                .filter(e -> e.getValue().equals(label))
                .map(Map.Entry::getKey)
                .findFirst();
    }

}
