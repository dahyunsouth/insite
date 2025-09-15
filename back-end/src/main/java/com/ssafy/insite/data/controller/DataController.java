package com.ssafy.insite.data.controller;

import com.ssafy.insite.common.dto.response.BaseResponse;
import com.ssafy.insite.data.dto.response.SeoulDistrictCountResponseDto;
import com.ssafy.insite.data.dto.response.SeoulDongCountResponseDto;
import com.ssafy.insite.data.enums.SeoulDistrict;
import com.ssafy.insite.data.service.DataService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
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
            @Parameter(description = "자치구명 및 행정동명")
            @RequestParam("district") SeoulDistrict district,
            @RequestParam("dong") String dong
    ) {
        SeoulDongCountResponseDto response = dataService.countByDong(district, dong);

        return new BaseResponse<>(response);
    }
}
