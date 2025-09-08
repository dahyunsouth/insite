package com.ssafy.insite.auth.service;

import com.ssafy.insite.auth.entity.RefreshToken;

public interface RefreshTokenService {
    // Refresh Token 저장
    void saveRefreshToken(String userUuid, String token);

    // Refresh Token 조회
    RefreshToken inquiryRefreshToken(String userUuid);

    // Refresh Token 삭제
    void deleteRefreshToken(String userUuid);
}
