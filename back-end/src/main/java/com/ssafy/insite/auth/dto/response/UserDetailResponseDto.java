package com.ssafy.insite.auth.dto.response;

import com.ssafy.insite.common.enums.Provider;
import com.ssafy.insite.common.enums.UserType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@AllArgsConstructor
@Builder
public class UserDetailResponseDto {
    private String uuid;
    private String email;
    private String nickname;
    private Provider provider;
    private UserType type;
}
