package com.ssafy.insite.auth.dto.request;

import com.ssafy.insite.common.enums.ProfileType;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class ModifyAccountRequestDto {
    private String password;
    private String nickname;
    private ProfileType profile;
}
