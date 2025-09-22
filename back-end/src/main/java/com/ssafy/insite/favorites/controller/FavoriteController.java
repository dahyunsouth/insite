package com.ssafy.insite.favorites.controller;

import com.ssafy.insite.auth.jwt.CustomUserDetails;
import com.ssafy.insite.common.dto.response.BaseResponse;
import com.ssafy.insite.favorites.dto.response.UserTradeAreaFavoritesResponseDto;
import com.ssafy.insite.favorites.service.FavoriteService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/favorites")
@RequiredArgsConstructor
public class FavoriteController {
    private final FavoriteService favoriteService;

    @PostMapping
    @Operation(summary = "상권 저장")
    @PreAuthorize("hasRole('USER')")
    public BaseResponse<Void> addFavorite(@RequestParam int trdarCd,
                                          @AuthenticationPrincipal CustomUserDetails userDetails) {
        favoriteService.addFavorite(userDetails.getUuid(), trdarCd);
        return new BaseResponse<>();
    }

    @DeleteMapping("/{trdarCd}")
    @Operation(summary = "상권 저장 해제")
    @PreAuthorize("hasRole('USER')")
    public BaseResponse<Void> removeFavorite(@PathVariable int trdarCd,
                                             @AuthenticationPrincipal CustomUserDetails userDetails) {
        favoriteService.removeFavorite(userDetails.getUuid(), trdarCd);
        return new BaseResponse<>();
    }

    @GetMapping
    @Operation(summary = "저장된 상권 목록 조회")
    @PreAuthorize("hasRole('USER')")
    public BaseResponse<UserTradeAreaFavoritesResponseDto> getFavorites(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        UserTradeAreaFavoritesResponseDto response = favoriteService.getFavorites(userDetails.getUuid());
        return new BaseResponse<>(response);
    }
}
