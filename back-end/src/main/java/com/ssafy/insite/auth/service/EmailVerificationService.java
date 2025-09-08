package com.ssafy.insite.auth.service;

public interface EmailVerificationService {
    // 인증코드 발송
    void sendVerificationCode(String email);

    // 인증코드 검증
    void verifyCode(String email, String code);
}
