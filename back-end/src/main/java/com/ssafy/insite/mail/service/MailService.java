package com.ssafy.insite.mail.service;

import com.ssafy.insite.common.dto.response.BaseResponseStatus;
import com.ssafy.insite.common.exception.BaseException;
import com.ssafy.insite.mail.dto.request.MailSendRequestDto;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MailService {
    private final JavaMailSender javaMailSender;

    @Value("${spring.mail.username}")
    private String senderEmail;

    // 이메일 전송
    public void sendEmail(MailSendRequestDto request) {
        MimeMessage message = javaMailSender.createMimeMessage();

        try {
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(senderEmail);                // 발신자 메일
            helper.setTo(request.getTo());              // 수신자 메일
            helper.setSubject(request.getSubject());    // 이메일 제목
            helper.setText(request.getContent(), true); // 이메일 내용

            javaMailSender.send(message);

        } catch (MessagingException e) {
            throw new BaseException(BaseResponseStatus.MAIL_SEND_FAIL);
        }
    }
}
