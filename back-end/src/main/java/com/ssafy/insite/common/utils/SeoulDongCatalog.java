package com.ssafy.insite.common.utils;

import com.ssafy.insite.data.enums.SeoulDistrict;
import java.util.Map;
import java.util.Set;
import java.util.Collections;

public final class SeoulDongCatalog {
    private SeoulDongCatalog() { }

    // 정규화 규칙: '·'와 '.'을 '?'로 변환
    public static String normalize(String name) {
        if (name == null) return null;
        return name.replace('·','?').replace('.','?').trim();
    }

    // 구 -> 허용 동 이름(정규화된 값) 목록
    private static final Map<SeoulDistrict, Set<String>> DONGS =
            Map.ofEntries(
                    Map.entry(SeoulDistrict.GANGNAM_GU, Set.of("개포1동", "개포2동", "개포3동", "개포4동", "논현1동", "논현2동", "대치1동", "대치2동", "대치4동", "도곡1동", "도곡2동", "삼성1동", "삼성2동", "세곡동", "수서동", "신사동", "압구정동", "역삼1동", "역삼2동", "일원1동", "일원본동", "청담동")),
                    Map.entry(SeoulDistrict.GANGDONG_GU, Set.of("강일동", "고덕1동", "고덕2동", "길동", "둔촌1동", "둔촌2동", "명일1동", "명일2동", "상일1동", "상일2동", "성내1동", "성내2동", "성내3동", "암사1동", "암사2동", "암사3동", "천호1동", "천호2동", "천호3동")),
                    Map.entry(SeoulDistrict.GANGBUK_GU, Set.of("미아동", "번1동", "번2동", "번3동", "삼각산동", "삼양동", "송중동", "송천동", "수유1동", "수유2동", "수유3동", "우이동", "인수동")),
                    Map.entry(SeoulDistrict.GANGSEO_GU, Set.of("가양1동", "가양2동", "가양3동", "공항동", "등촌1동", "등촌2동", "등촌3동", "발산1동", "방화1동", "방화2동", "방화3동", "염창동", "우장산동", "화곡1동", "화곡2동", "화곡3동", "화곡4동", "화곡6동", "화곡8동", "화곡본동")),
                    Map.entry(SeoulDistrict.GWANAK_GU, Set.of("낙성대동", "난곡동", "난향동", "남현동", "대학동", "미성동", "보라매동", "삼성동", "서림동", "서원동", "성현동", "신림동", "신사동", "신원동", "은천동", "인헌동", "조원동", "중앙동", "청룡동", "청림동", "행운동")),
                    Map.entry(SeoulDistrict.GWANGJIN_GU, Set.of("광장동", "구의1동", "구의2동", "구의3동", "군자동", "능동", "자양1동", "자양2동", "자양3동", "자양4동", "중곡1동", "중곡2동", "중곡3동", "중곡4동", "화양동")),
                    Map.entry(SeoulDistrict.GURO_GU, Set.of("가리봉동", "개봉1동", "개봉2동", "개봉3동", "고척1동", "고척2동", "구로1동", "구로2동", "구로3동", "구로4동", "구로5동", "수궁동", "신도림동", "오류1동", "오류2동", "항동")),
                    Map.entry(SeoulDistrict.GEUMCHEON_GU, Set.of("가산동", "독산1동", "독산2동", "독산3동", "독산4동", "시흥1동", "시흥2동", "시흥3동", "시흥4동", "시흥5동")),
                    Map.entry(SeoulDistrict.NOWON_GU, Set.of("공릉1동", "공릉2동", "상계10동", "상계1동", "상계2동", "상계3?4동", "상계5동", "상계6?7동", "상계8동", "상계9동", "월계1동", "월계2동", "월계3동", "중계1동", "중계2?3동", "중계4동", "중계본동", "하계1동", "하계2동")),
                    Map.entry(SeoulDistrict.DOBONG_GU, Set.of("도봉1동", "도봉2동", "방학1동", "방학2동", "방학3동", "쌍문1동", "쌍문2동", "쌍문3동", "쌍문4동", "창1동", "창2동", "창3동", "창4동", "창5동")),
                    Map.entry(SeoulDistrict.DONGDAEMUN_GU, Set.of("답십리1동", "답십리2동", "용신동", "이문1동", "이문2동", "장안1동", "장안2동", "전농1동", "전농2동", "제기동", "청량리동", "회기동", "휘경1동", "휘경2동")),
                    Map.entry(SeoulDistrict.DONGJAK_GU, Set.of("노량진1동", "노량진2동", "대방동", "사당1동", "사당2동", "사당3동", "사당4동", "사당5동", "상도1동", "상도2동", "상도3동", "상도4동", "신대방1동", "신대방2동", "흑석동")),
                    Map.entry(SeoulDistrict.MAPO_GU, Set.of("공덕동", "대흥동", "도화동", "망원1동", "망원2동", "상암동", "서강동", "서교동", "성산1동", "성산2동", "신수동", "아현동", "연남동", "염리동", "용강동", "합정동")),
                    Map.entry(SeoulDistrict.SEODAEMUN_GU, Set.of("남가좌1동", "남가좌2동", "북가좌1동", "북가좌2동", "북아현동", "신촌동", "연희동", "천연동", "충현동", "홍은1동", "홍은2동", "홍제1동", "홍제2동", "홍제3동")),
                    Map.entry(SeoulDistrict.SEOCHO_GU, Set.of("내곡동", "반포1동", "반포2동", "반포3동", "반포4동", "반포본동", "방배1동", "방배2동", "방배3동", "방배4동", "방배본동", "서초1동", "서초2동", "서초3동", "서초4동", "양재1동", "양재2동", "잠원동")),
                    Map.entry(SeoulDistrict.SEONGDONG_GU, Set.of("금호1가동", "금호2?3가동", "금호4가동", "마장동", "사근동", "성수1가1동", "성수1가2동", "성수2가1동", "성수2가3동", "송정동", "옥수동", "왕십리2동", "왕십리도선동", "용답동", "응봉동", "행당1동", "행당2동")),
                    Map.entry(SeoulDistrict.SEONGBUK_GU, Set.of("길음1동", "길음2동", "돈암1동", "돈암2동", "동선동", "보문동", "삼선동", "석관동", "성북동", "안암동", "월곡1동", "월곡2동", "장위1동", "장위2동", "장위3동", "정릉1동", "정릉2동", "정릉3동", "정릉4동", "종암동")),
                    Map.entry(SeoulDistrict.SONGPA_GU, Set.of("가락1동", "가락2동", "가락본동", "거여1동", "거여2동", "마천1동", "마천2동", "문정1동", "문정2동", "방이1동", "방이2동", "삼전동", "석촌동", "송파1동", "송파2동", "오금동", "오륜동", "위례동", "잠실2동", "잠실3동", "잠실4동", "잠실6동", "잠실7동", "잠실본동", "장지동", "풍납1동", "풍납2동")),
                    Map.entry(SeoulDistrict.YANGCHEON_GU, Set.of("목1동", "목2동", "목3동", "목4동", "목5동", "신월1동", "신월2동", "신월3동", "신월4동", "신월5동", "신월6동", "신월7동", "신정1동", "신정2동", "신정3동", "신정4동", "신정6동", "신정7동")),
                    Map.entry(SeoulDistrict.YEONGDEUNGPO_GU, Set.of("당산1동", "당산2동", "대림1동", "대림2동", "대림3동", "도림동", "문래동", "신길1동", "신길3동", "신길4동", "신길5동", "신길6동", "신길7동", "양평1동", "양평2동", "여의동", "영등포동", "영등포본동")),
                    Map.entry(SeoulDistrict.YONGSAN_GU, Set.of("남영동", "보광동", "서빙고동", "용문동", "용산2가동", "원효로1동", "원효로2동", "이촌1동", "이촌2동", "이태원1동", "이태원2동", "청파동", "한강로동", "한남동", "효창동", "후암동")),
                    Map.entry(SeoulDistrict.EUNPYEONG_GU, Set.of("갈현1동", "갈현2동", "구산동", "녹번동", "대조동", "불광1동", "불광2동", "수색동", "신사1동", "신사2동", "역촌동", "응암1동", "응암2동", "응암3동", "증산동", "진관동")),
                    Map.entry(SeoulDistrict.JONGNO_GU, Set.of("가회동", "교남동", "무악동", "부암동", "사직동", "삼청동", "숭인1동", "숭인2동", "이화동", "종로1?2?3?4가동", "종로5?6가동", "창신1동", "창신2동", "창신3동", "청운효자동", "평창동", "혜화동")),
                    Map.entry(SeoulDistrict.JUNG_GU, Set.of("광희동", "다산동", "동화동", "명동", "소공동", "신당5동", "신당동", "약수동", "을지로동", "장충동", "중림동", "청구동", "필동", "황학동", "회현동")),
                    Map.entry(SeoulDistrict.JUNGRANG_GU, Set.of("망우3동", "망우본동", "면목2동", "면목3?8동", "면목4동", "면목5동", "면목7동", "면목본동", "묵1동", "묵2동", "상봉1동", "상봉2동", "신내1동", "신내2동", "중화1동", "중화2동"))
            );

    public static Set<String> list(SeoulDistrict district) {
        return DONGS.getOrDefault(district, Collections.emptySet());
    }

    public static boolean isValid(SeoulDistrict district, String dongName) {
        if (district == null || dongName == null) return false;
        return list(district).contains(normalize(dongName));
    }
}
