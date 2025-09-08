package com.ssafy.insite.auth.dto.response;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@AllArgsConstructor
@Builder
public class LoginResponseDto {
    private String accessToken;

    @JsonIgnore // 응답 본문에 포함되지 않도록 직렬화 무시
    private String refreshToken;
}
