package com.ssafy.insite.auth.service;

import com.ssafy.insite.auth.utils.AuthenticationCodeGenerator;
import com.ssafy.insite.auth.utils.HTMLTemplateReader;
import com.ssafy.insite.common.dto.response.BaseResponseStatus;
import com.ssafy.insite.common.exception.BaseException;
import com.ssafy.insite.common.utils.RedisKeyGenerator;
import com.ssafy.insite.mail.dto.request.MailSendRequestDto;
import com.ssafy.insite.mail.service.MailService;
import java.time.Duration;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailVerificationServiceImpl implements EmailVerificationService {

    private final RedisTemplate<String, Object> redisTemplate;
    private final MailService mailService;

    // 인증코드 발송
    @Override
    public void sendVerificationCode(String email) {
        String emailVerifyCodeKey = RedisKeyGenerator.generateEmailVerifyCodeKey(email);
        String code = AuthenticationCodeGenerator.generateCode();

        // 1. Redis에 저장
        Duration expireTime = Duration.ofMinutes(3); // 유효 시간 (3분)
        redisTemplate.opsForValue()
                .set(emailVerifyCodeKey, code, expireTime); // Redis에 저장 (Key: email, Value: code, TTL: 3분)

        // 2. 이메일 내용 구성
        String subject = "Welcome to Insite";

        String rawTemplate = HTMLTemplateReader.loadTemplateAsString("templates/email_verification_form.html");
        String content = rawTemplate.replace("${code}", code);

        MailSendRequestDto emailSendRequestDto = MailSendRequestDto.builder()
                .to(email)
                .subject(subject)
                .content(content)
                .build();

        // 3. 이메일 전송
        mailService.sendEmail(emailSendRequestDto);
    }

    // 인증코드 검증
    @Override
    public void verifyCode(String email, String code) {
        String emailVerifyCodeKey = RedisKeyGenerator.generateEmailVerifyCodeKey(email);
        String emailVerifiedKey = RedisKeyGenerator.generateEmailVerifiedKey(email);
        Object storedCode = redisTemplate.opsForValue().get(emailVerifyCodeKey);

        if (storedCode == null) {
            throw new BaseException(BaseResponseStatus.EMAIL_VERIFICATION_CODE_NOT_FOUND);
        }

        if (!storedCode.toString().equals(code)) {
            throw new BaseException(BaseResponseStatus.EMAIL_VERIFICATION_CODE_MISMATCH);
        }

        // Redis에 인증완료 상태 저장
        redisTemplate.opsForValue().set(emailVerifiedKey, "true", Duration.ofMinutes(5));

        // Redis에서 인증코드 삭제
        redisTemplate.delete(emailVerifyCodeKey);
    }
}
