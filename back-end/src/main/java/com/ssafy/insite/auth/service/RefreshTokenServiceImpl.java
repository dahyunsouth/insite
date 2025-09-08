package com.ssafy.insite.auth.service;

import com.ssafy.insite.auth.entity.RefreshToken;
import com.ssafy.insite.common.dto.response.BaseResponseStatus;
import com.ssafy.insite.common.exception.BaseException;
import com.ssafy.insite.common.utils.RedisKeyGenerator;
import java.time.LocalDateTime;
import java.util.concurrent.TimeUnit;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class RefreshTokenServiceImpl implements RefreshTokenService {

    @Value("${jwt.refresh-expire-time}")
    private long refreshTokenValidityInMilliseconds;

    private final RedisTemplate<String, RefreshToken> redisTemplate; // RefreshToken 직렬화에 맞춰진 RedisTemplate

    // Refresh Token 저장
    @Override
    public void saveRefreshToken(String uuid, String token) {
        LocalDateTime expiry = LocalDateTime.now().plusSeconds(refreshTokenValidityInMilliseconds / 1000);
        String key = RedisKeyGenerator.generateRefreshTokenKey(uuid);

        RefreshToken refreshToken = RefreshToken.builder()
                .uuid(uuid)
                .token(token)
                .expiryAt(expiry)
                .build();

        // TTL을 Refresh Token 만료와 동일하게 설정
        redisTemplate.opsForValue().set(
                key,
                refreshToken,
                refreshTokenValidityInMilliseconds,
                TimeUnit.MILLISECONDS
        );
    }

    // Refresh Token 조회
    @Override
    public RefreshToken inquiryRefreshToken(String uuid) {
        String key = RedisKeyGenerator.generateRefreshTokenKey(uuid);
        RefreshToken refreshToken = redisTemplate.opsForValue().get(key);

        if (refreshToken == null) {
            throw new BaseException(BaseResponseStatus.TOKEN_NOT_VALID);
        }

        return refreshToken;
    }

    // Refresh Token 삭제
    @Override
    public void deleteRefreshToken(String uuid) {
        String key = RedisKeyGenerator.generateRefreshTokenKey(uuid);
        redisTemplate.delete(key);
    }
}
