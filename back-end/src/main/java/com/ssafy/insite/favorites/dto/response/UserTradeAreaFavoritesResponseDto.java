package com.ssafy.insite.favorites.dto.response;

import com.ssafy.insite.favorites.entity.UserTradeAreaFavorite;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@AllArgsConstructor
@Builder
public class UserTradeAreaFavoritesResponseDto {
    private List<UserTradeAreaFavorite> favorites;
}
