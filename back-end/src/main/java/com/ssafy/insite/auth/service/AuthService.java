package com.ssafy.insite.auth.service;

import com.ssafy.insite.auth.dto.request.LoginRequestDto;
import com.ssafy.insite.auth.dto.request.ModifyAccountRequestDto;
import com.ssafy.insite.auth.dto.request.SignupRequestDto;
import com.ssafy.insite.auth.dto.response.LoginResponseDto;
import com.ssafy.insite.auth.dto.response.UserDetailResponseDto;

public interface AuthService {
    // 로그인
    LoginResponseDto login(LoginRequestDto request);

    // 로그아웃
    void logout(String refreshToken);

    // 회원가입
    void signup(SignupRequestDto request);

    // 회원탈퇴
    void deleteAccount(String uuid);

    // 회원정보 조회
    UserDetailResponseDto inquiryAccount(String uuid);

    // 회원정보 수정
    void modifyAccount(String uuid, ModifyAccountRequestDto request);

    // 이메일 중복확인
    boolean checkEmailDuplicate(String email);

    // 닉네임 중복확인
    boolean checkNicknameDuplicate(String nickname);

    // access token 재발급
    LoginResponseDto refresh(String refreshToken);
}
