package com.ssafy.insite.favorites.repository;

import com.ssafy.insite.favorites.entity.UserTradeAreaFavorite;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserTradeAreaFavoriteRepository extends JpaRepository<UserTradeAreaFavorite, Long> {
    // 저장된 상권 목록 조회
    List<UserTradeAreaFavorite> findByUserUuid(String userUuid);

    // 상권 저장 여부 확인
    Optional<UserTradeAreaFavorite> findByUserUuidAndTrdarCd(String userUuid, int trdarCd);

    // 상권 저장 해제
    void deleteByUserUuidAndTrdarCd(String userUuid, int trdarCd);
}
