package com.ssafy.insite.mail.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MailSendRequestDto {

    @Email(message = "이메일 형식이 올바르지 않습니다.")
    @NotBlank(message = "이메일 주소는 필수 입력값 입니다.")
    private String to;

    @NotBlank(message = "제목은 필수 입력값 입니다.")
    private String subject;

    @NotBlank(message = "내용은 필수 입력값 입니다.")
    private String content;
}
