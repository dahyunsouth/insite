package com.ssafy.insite.auth.service;

import com.ssafy.insite.auth.dto.request.LoginRequestDto;
import com.ssafy.insite.auth.dto.request.ModifyAccountRequestDto;
import com.ssafy.insite.auth.dto.request.SignupRequestDto;
import com.ssafy.insite.auth.dto.response.LoginResponseDto;
import com.ssafy.insite.auth.dto.response.UserDetailResponseDto;
import com.ssafy.insite.auth.entity.RefreshToken;
import com.ssafy.insite.auth.jwt.JwtTokenProvider;
import com.ssafy.insite.auth.repository.UserRepository;
import com.ssafy.insite.common.dto.response.BaseResponseStatus;
import com.ssafy.insite.auth.entity.User;
import com.ssafy.insite.common.enums.ProfileType;
import com.ssafy.insite.common.enums.Provider;
import com.ssafy.insite.common.exception.BaseException;
import com.ssafy.insite.common.utils.RedisKeyGenerator;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {
    private final PasswordEncoder passwordEncoder;
    private final RedisTemplate<String, Object> redisTemplate;
    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final RefreshTokenService refreshTokenService;

    // 로그인
    @Override
    @Transactional(readOnly = true)
    public LoginResponseDto login(LoginRequestDto request) {
        // 1. 사용자 이메일로 DB에서 조회
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BaseException(BaseResponseStatus.FAILED_TO_LOGIN));

        // 2. 비밀번호 검증
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BaseException(BaseResponseStatus.FAILED_TO_LOGIN);
        }

        // 3. Access Token 발급
        String accessToken = jwtTokenProvider.generateAccessToken(user.getUuid(), user.getType());

        // 4. Refresh Token 발급
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getUuid());

        // 5. Refresh Token DB에 저장
        refreshTokenService.saveRefreshToken(user.getUuid(), refreshToken);

        // 6. LoginResponse 생성 후 반환
        return LoginResponseDto.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .build();
    }

    // 로그아웃
    @Override
    public void logout(String refreshToken) {
        // 1. token 유효성 검사
        if (!jwtTokenProvider.validateToken(refreshToken)) {
            throw new BaseException(BaseResponseStatus.TOKEN_NOT_VALID);
        }

        // 2. UUID 추출
        String userUuid = jwtTokenProvider.getClaims(refreshToken).get("uuid", String.class);

        // 3. 저장된 refresh token 삭제
        refreshTokenService.deleteRefreshToken(userUuid);
    }

    // 회원가입
    @Override
    @Transactional
    public void signup(SignupRequestDto request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BaseException(BaseResponseStatus.DUPLICATED_USER);
        }

        // 계정 등록 전 이메일 인증여부 검증
        String key = RedisKeyGenerator.generateEmailVerifiedKey(request.getEmail());
        String verified = (String) redisTemplate.opsForValue().get(key);

        if (!"true".equals(verified)) {
            throw new BaseException(BaseResponseStatus.EMAIL_NOT_VERIFIED);
        }

        // UUID 생성
        String uuid = UUID.randomUUID().toString();

        // User Entity 생성 및 저장
        User user = User.builder()
                .uuid(uuid)
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .nickname(request.getNickname())
                .profile(ProfileType.DEFAULT)
                .provider(Provider.NONE)
                .type(request.getType())
                .build();

        userRepository.save(user);

        // 회원가입 후 인증상태 삭제
        redisTemplate.delete(key);
    }

    // 회원탈퇴
    @Override
    @Transactional
    public void deleteAccount(String uuid) {
        if (!userRepository.existsByUuid(uuid)) {
            throw new BaseException(BaseResponseStatus.NO_EXIST_USER);
        }

        userRepository.deleteByUuid(uuid);
    }

    // 회원정보 조회
    @Override
    @Transactional(readOnly = true)
    public UserDetailResponseDto inquiryAccount(String uuid) {
        User user = userRepository.findByUuid(uuid)
                .orElseThrow(() -> new BaseException(BaseResponseStatus.NO_EXIST_USER));

        return UserDetailResponseDto.builder()
                .uuid(user.getUuid())
                .email(user.getEmail())
                .nickname(user.getNickname())
                .profile(user.getProfile())
                .provider(user.getProvider())
                .type(user.getType())
                .build();
    }

    // 회원정보 수정
    @Override
    @Transactional
    public void modifyAccount(String uuid, ModifyAccountRequestDto request) {
        User user = userRepository.findByUuid(uuid)
                .orElseThrow(() -> new BaseException(BaseResponseStatus.NO_EXIST_USER));

        String newNickname = request.getNickname();
        String newPassword = request.getPassword();
        ProfileType profile = request.getProfile();

        if (newNickname != null && !newNickname.isEmpty() && !newNickname.equals("null")) {
            user.updateNickname(newNickname);
        }

        if (newPassword != null && !newPassword.isEmpty() && !newPassword.equals("null")) {
            user.updatePassword(passwordEncoder.encode(newPassword));
        }

        if (profile != null) {
            user.updateProfile(profile);
        }
    }

    // 이메일 중복확인
    @Override
    @Transactional(readOnly = true)
    public boolean checkEmailDuplicate(String email) {
        return userRepository.existsByEmail(email);
    }

    // 닉네임 중복확인
    @Override
    @Transactional(readOnly = true)
    public boolean checkNicknameDuplicate(String nickname) {
        return userRepository.existsByNickname(nickname);
    }

    // access token 재발급
    @Override
    @Transactional(readOnly = true)
    public LoginResponseDto refresh(String refreshToken) {
        // 1. token 유효성 검사
        if (!jwtTokenProvider.validateToken(refreshToken)) {
            throw new BaseException(BaseResponseStatus.TOKEN_NOT_VALID);
        }

        // 2. UUID 추출
        String userUuid = jwtTokenProvider.getClaims(refreshToken).get("uuid", String.class);

        // 3. 저장된 refresh token 조회 및 비교
        RefreshToken stored = refreshTokenService.inquiryRefreshToken(userUuid);

        if (!stored.getToken().equals(refreshToken)) {
            throw new BaseException(BaseResponseStatus.TOKEN_NOT_VALID);
        }

        // 4. 사용자 조회
        User user = userRepository.findByUuid(userUuid)
                .orElseThrow(() -> new BaseException(BaseResponseStatus.NO_EXIST_USER));

        // 5. access token 재발급
        String newAccessToken = jwtTokenProvider.generateAccessToken(user.getUuid(), user.getType());

        // 6. refresh token 재발급
        String newRefreshToken = jwtTokenProvider.generateRefreshToken(user.getUuid());

        // 7. refresh token DB 갱신
        refreshTokenService.saveRefreshToken(user.getUuid(), newRefreshToken);

        // 8. LoginResponse 생성 후 반환
        return LoginResponseDto.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .build();
    }
}
