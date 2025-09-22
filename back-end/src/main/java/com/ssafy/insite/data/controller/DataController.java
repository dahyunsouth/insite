package com.ssafy.insite.data.controller;

import com.ssafy.insite.common.dto.response.BaseResponse;
import com.ssafy.insite.data.dto.response.RecommendationResponseDto;
import com.ssafy.insite.data.dto.response.SeoulDistrictCountResponseDto;
import com.ssafy.insite.data.dto.response.SeoulDongCountResponseDto;
import com.ssafy.insite.data.dto.response.TradeAreaChngeIxInfoResponseDto;
import com.ssafy.insite.data.dto.response.TradeAreaCodeResponseDto;
import com.ssafy.insite.data.dto.response.TradeAreaDetailResponseDto;
import com.ssafy.insite.data.dto.response.TradeAreaFlpopInfoResponseDto;
import com.ssafy.insite.data.dto.response.TradeAreaRepopInfoResponseDto;
import com.ssafy.insite.data.dto.response.TradeAreaSalesInfoResponseDto;
import com.ssafy.insite.data.dto.response.TradeAreaScoreResponseDto;
import com.ssafy.insite.data.dto.response.TradeAreaStorInfoResponseDto;
import com.ssafy.insite.data.dto.response.TradeAreaWrcPopltnInfoResponseDto;
import com.ssafy.insite.data.dto.response.TradeAreasResponseDto;
import com.ssafy.insite.data.enums.SeoulDistrict;
import com.ssafy.insite.data.enums.TradeAreaType;
import com.ssafy.insite.data.service.DataService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/data")
@RequiredArgsConstructor
public class DataController {
    private final DataService dataService;

    @GetMapping("/list-gu")
    @Operation(summary = "자치구 목록 조회")
    public BaseResponse<List<String>> getDistriceList() {
        List<String> response = dataService.getDistriceList();
        return new BaseResponse<>(response);
    }

    @GetMapping("/list-dong")
    @Operation(summary = "행정동 목록 조회")
    public BaseResponse<List<String>> getDongList(
            @Parameter(description = "자치구명")
            @RequestParam("district") SeoulDistrict district
    ) {
        List<String> response = dataService.getDongList(district);
        return new BaseResponse<>(response);
    }

    @GetMapping("/rec-sys")
    @Operation(summary = "상권 추천 결과 조회")
    public BaseResponse<RecommendationResponseDto> findTop3ByDistrictAndType(
            @Parameter(description = "자치구명")
            @RequestParam("district") SeoulDistrict district,
            @Parameter(description = "상권유형")
            @RequestParam("type") TradeAreaType type
    ) {
        RecommendationResponseDto response = dataService.findTop3ByDistrictAndType(district, type);

        return new BaseResponse<>(response);
    }

    @GetMapping("/score")
    @Operation(summary = "상권 추천 점수 조회")
    public BaseResponse<TradeAreaScoreResponseDto> findTradeAreaScore(
            @Parameter(description = "상권명")
            @RequestParam("trdarCdNm") String tradeAreaName
    ) {
        TradeAreaScoreResponseDto response = dataService.findTradeAreaScore(tradeAreaName);

        return new BaseResponse<>(response);
    }

    @GetMapping("/count-by-gu")
    @Operation(summary = "자치구별 상권 개수 조회")
    public BaseResponse<SeoulDistrictCountResponseDto> countByDistrict(
            @Parameter(description = "자치구명")
            @RequestParam("district") SeoulDistrict district
    ) {
        SeoulDistrictCountResponseDto response = dataService.countByDistrict(district);

        return new BaseResponse<>(response);
    }

    @GetMapping("/count-by-dong")
    @Operation(summary = "행정동별 상권 개수 조회")
    public BaseResponse<SeoulDongCountResponseDto> countByDong(
            @Parameter(description = "자치구")
            @RequestParam("district") SeoulDistrict district,
            @Parameter(description = "행정동")
            @RequestParam("dong") String dong
    ) {
        SeoulDongCountResponseDto response = dataService.countByDong(district, dong);

        return new BaseResponse<>(response);
    }

    @GetMapping("/trade-area-detail")
    @Operation(summary = "상권 상세 정보 조회")
    public BaseResponse<TradeAreaDetailResponseDto> findTradeAreaDetail(
            @Parameter(description = "상권_코드")
            @RequestParam("trdarCd") Integer trdarCd
    ) {
        TradeAreaDetailResponseDto response = dataService.findTradeAreaDetail(trdarCd);
        return new BaseResponse<>(response);
    }

    @GetMapping("/latest-quarter")
    @Operation(summary = "최신 분기(년분기_코드) 조회")
    public BaseResponse<String> getLatestQuarterCode() {
        String latestCode = dataService.findLatestQuarterCode();
        return new BaseResponse<>(latestCode);
    }

    @GetMapping("/trade-areas")
    @Operation(summary = "행정동 내 상권 리스트 조회")
    public BaseResponse<TradeAreasResponseDto> listByDistrictAndDong(
            @Parameter(description = "자치구")
            @RequestParam("district") SeoulDistrict district,
            @Parameter(description = "행정동")
            @RequestParam("dong") String dong
    ) {
        TradeAreasResponseDto response = dataService.listByDistrictAndDong(district, dong);
        return new BaseResponse<>(response);
    }

    @GetMapping("/info/stor")
    @Operation(summary = "상권별 점포 정보 조회")
    public BaseResponse<TradeAreaStorInfoResponseDto> findStorInfoByCode(
            @Parameter(description = "상권코드")
            @RequestParam("trdarCd") int trdarCd
    ) {
        TradeAreaStorInfoResponseDto response = dataService.findStorInfoByCode(trdarCd);
        return new BaseResponse<>(response);
    }

    @GetMapping("/info/sales")
    @Operation(summary = "상권별 매출 정보 조회")
    public BaseResponse<TradeAreaSalesInfoResponseDto> findSalesInfoByCode(
            @Parameter(description = "상권코드")
            @RequestParam("trdarCd") int trdarCd
    ) {
        TradeAreaSalesInfoResponseDto response = dataService.findSalesInfoByCode(trdarCd);
        return new BaseResponse<>(response);
    }

    @GetMapping("/info/wrc-popltn")
    @Operation(summary = "상권별 직장인구 정보 조회")
    public BaseResponse<TradeAreaWrcPopltnInfoResponseDto> findWrcPopltnInfoByCode(
            @Parameter(description = "상권코드")
            @RequestParam("trdarCd") int trdarCd
    ) {
        TradeAreaWrcPopltnInfoResponseDto response = dataService.findWrcPopltnInfoByCode(trdarCd);
        return new BaseResponse<>(response);
    }

    @GetMapping("/info/repop")
    @Operation(summary = "상권별 상주인구 정보 조회")
    public BaseResponse<TradeAreaRepopInfoResponseDto> findRepopInfoByCode(
            @Parameter(description = "상권코드")
            @RequestParam("trdarCd") int trdarCd
    ) {
        TradeAreaRepopInfoResponseDto response = dataService.findRepopInfoByCode(trdarCd);
        return new BaseResponse<>(response);
    }

    @GetMapping("/info/flpop")
    @Operation(summary = "상권별 유동인구 정보 조회")
    public BaseResponse<TradeAreaFlpopInfoResponseDto> findFlpopInfoByCode(
            @Parameter(description = "상권코드")
            @RequestParam("trdarCd") int trdarCd
    ) {
        TradeAreaFlpopInfoResponseDto response = dataService.findFlpopInfoByCode(trdarCd);
        return new BaseResponse<>(response);
    }

    @GetMapping("/info/chnge-ix")
    @Operation(summary = "상권변화지표 정보 조회")
    public BaseResponse<TradeAreaChngeIxInfoResponseDto> findChngeIxInfoByCode(
            @Parameter(description = "상권코드")
            @RequestParam("trdarCd") int trdarCd
    ) {
        TradeAreaChngeIxInfoResponseDto response = dataService.findChngeIxInfoByCode(trdarCd);
        return new BaseResponse<>(response);
    }

    @GetMapping("/code")
    @Operation(summary = "상권명으로 상권코드 조회")
    public BaseResponse<TradeAreaCodeResponseDto> findCodeByName(
            @Parameter(description = "상권명")
            @RequestParam("trdarCdNm") String trdarCdNm
    ) {
        TradeAreaCodeResponseDto response = dataService.findCodeByName(trdarCdNm);
        return new BaseResponse<>(response);
    }
}
