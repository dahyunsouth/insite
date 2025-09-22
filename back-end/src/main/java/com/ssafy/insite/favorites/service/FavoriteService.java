package com.ssafy.insite.favorites.service;

import com.ssafy.insite.common.exception.BaseException;
import com.ssafy.insite.favorites.dto.response.UserTradeAreaFavoritesResponseDto;
import com.ssafy.insite.favorites.entity.UserTradeAreaFavorite;
import com.ssafy.insite.favorites.repository.UserTradeAreaFavoriteRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.ssafy.insite.common.dto.response.BaseResponseStatus;

@Service
@RequiredArgsConstructor
public class FavoriteService {
    private final UserTradeAreaFavoriteRepository favoriteRepository;

    // 상권 저장
    @Transactional
    public void addFavorite(String userUuid, int trdarCd) {
        // 상권 저장 여부 확인
        boolean exists = favoriteRepository.findByUserUuidAndTrdarCd(userUuid, trdarCd).isPresent();

        if (exists) {
            throw new BaseException(BaseResponseStatus.DUPLICATE_FAVORITE);
        }

        UserTradeAreaFavorite favorite = UserTradeAreaFavorite.builder()
                .userUuid(userUuid)
                .trdarCd(trdarCd)
                .build();

        favoriteRepository.save(favorite);
    }

    // 상권 저장 해제
    @Transactional
    public void removeFavorite(String userUuid, int trdarCd) {
        UserTradeAreaFavorite favorite = favoriteRepository.findByUserUuidAndTrdarCd(userUuid, trdarCd)
                .orElseThrow(() -> new BaseException(BaseResponseStatus.FAVORITE_NOT_FOUND));

        favoriteRepository.delete(favorite);
    }

    // 저장된 상권 목록 조회
    @Transactional(readOnly = true)
    public UserTradeAreaFavoritesResponseDto getFavorites(String userUuid) {
        List<UserTradeAreaFavorite> favorites = favoriteRepository.findByUserUuid(userUuid);

        return UserTradeAreaFavoritesResponseDto.builder()
                .favorites(favorites)
                .build();
    }
}
