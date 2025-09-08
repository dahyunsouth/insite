package com.ssafy.insite.auth.dto.request;

import com.ssafy.insite.common.enums.UserType;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class SignupRequestDto {
    private String email;
    private String password;
    private String nickname;
    @Schema(enumAsRef = true, description = "회원유형 (user: 예비 창업자, planner: 창업 플래너)")
    private UserType type;
}
