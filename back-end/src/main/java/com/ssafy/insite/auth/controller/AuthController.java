package com.ssafy.insite.auth.controller;

import com.ssafy.insite.auth.dto.request.EmailRequestDto;
import com.ssafy.insite.auth.dto.request.EmailVerificationRequestDto;
import com.ssafy.insite.auth.dto.request.LoginRequestDto;
import com.ssafy.insite.auth.dto.request.ModifyAccountRequestDto;
import com.ssafy.insite.auth.dto.request.SignupRequestDto;
import com.ssafy.insite.auth.dto.response.LoginResponseDto;
import com.ssafy.insite.auth.dto.response.UserDetailResponseDto;
import com.ssafy.insite.auth.jwt.CustomUserDetails;
import com.ssafy.insite.auth.service.AuthService;
import com.ssafy.insite.auth.service.EmailVerificationService;
import com.ssafy.insite.common.dto.response.BaseResponse;
import com.ssafy.insite.common.dto.response.BaseResponseStatus;
import com.ssafy.insite.common.exception.BaseException;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {
    @Value("${jwt.refresh-expire-time}")
    private long refreshTokenValidityInMilliseconds;

    private final AuthService authService;
    private final EmailVerificationService emailVerificationService;

    @PostMapping("/login")
    @Operation(summary = "로그인")
    public ResponseEntity<BaseResponse<LoginResponseDto>> login(@RequestBody LoginRequestDto request) {
        LoginResponseDto loginResponse = authService.login(request);

        // refreshToken을 HttpOnly 쿠키로 설정
        ResponseCookie refreshTokenCookie =
                ResponseCookie.from("refreshToken", loginResponse.getRefreshToken()) // name, value
                        .httpOnly(true) // JavaScript에서 접근 불가, XSS 공격 방어
                        .secure(true) // HTTPS 환경에서만
                        .path("/") // 쿠키가 전송(클라이언트 -> 서버)되는 요청 경로 범위, "/"면 모든 경로
                        .maxAge(refreshTokenValidityInMilliseconds / 1000) // 쿠키 유효 기간
                        .build();

        return ResponseEntity.status(HttpStatus.OK)
                .header(HttpHeaders.SET_COOKIE, refreshTokenCookie.toString())
                .body(new BaseResponse<>(loginResponse));
    }

    @PostMapping("/logout")
    @Operation(summary = "로그아웃")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<BaseResponse<Void>> logout(@CookieValue(value = "refreshToken") String refreshToken) {
        if (refreshToken == null) {
            throw new BaseException(BaseResponseStatus.TOKEN_NOT_VALID);
        }

        authService.logout(refreshToken);

        // 쿠키 무효화
        ResponseCookie invalidCookie =
                ResponseCookie.from("refreshToken", "")
                        .httpOnly(true)
                        .secure(true)
                        .path("/")
                        .maxAge(0) // 삭제
                        .build();

        return ResponseEntity.status(HttpStatus.OK)
                .header(HttpHeaders.SET_COOKIE, invalidCookie.toString())
                .body(new BaseResponse<>());
    }

    @PostMapping("/signup")
    @Operation(summary = "회원가입")
    public BaseResponse<Void> fanSignup(@RequestBody SignupRequestDto request) {
        authService.signup(request);

        return new BaseResponse<>();
    }

    @DeleteMapping("/user")
    @Operation(summary = "회원탈퇴")
    @PreAuthorize("hasRole('USER')")
    public BaseResponse<Void> deleteAccount(@AuthenticationPrincipal CustomUserDetails userDetails) {
        authService.deleteAccount(userDetails.getUuid());

        return new BaseResponse<>();
    }

    @GetMapping("/user")
    @Operation(summary = "회원정보 조회")
    @PreAuthorize("hasRole('USER')")
    public BaseResponse<UserDetailResponseDto> inquiryAccount(@AuthenticationPrincipal CustomUserDetails userDetails) {
        UserDetailResponseDto userInfo = authService.inquiryAccount(userDetails.getUuid());

        return new BaseResponse<>(userInfo);
    }

    @PutMapping("/user")
    @Operation(summary = "회원정보 수정")
    @PreAuthorize("hasRole('USER')")
    public BaseResponse<Void> modifyAccount(@RequestBody ModifyAccountRequestDto request,
                                            @AuthenticationPrincipal CustomUserDetails userDetails) {
        authService.modifyAccount(userDetails.getUuid(), request);

        return new BaseResponse<>();
    }

    @GetMapping("/check/email")
    @Operation(summary = "이메일 중복확인")
    public BaseResponse<Void> checkEmailDuplicate(@RequestParam String email) {
        if (authService.checkEmailDuplicate(email)) {
            throw new BaseException(BaseResponseStatus.DUPLICATED_USER);
        }

        return new BaseResponse<>();
    }

    @GetMapping("/check/nickname")
    @Operation(summary = "닉네임 중복확인")
    public BaseResponse<Void> checkNicknameDuplicate(@RequestParam String nickname) {
        if (authService.checkNicknameDuplicate(nickname)) {
            throw new BaseException(BaseResponseStatus.DUPLICATED_NICKNAME);
        }

        return new BaseResponse<>();
    }

    @PostMapping("/refresh")
    @Operation(summary = "access token 재발급")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<BaseResponse<LoginResponseDto>> refresh(
            @CookieValue(value = "refreshToken") String refreshToken) {
        if (refreshToken == null) {
            throw new BaseException(BaseResponseStatus.TOKEN_NOT_VALID);
        }

        LoginResponseDto loginResponse = authService.refresh(refreshToken);

        // 재발급 한 refreshToken을 HttpOnly 쿠키로 설정(갱신)
        ResponseCookie newRefreshTokenCookie =
                ResponseCookie.from("refreshToken", loginResponse.getRefreshToken()) // name, value
                        .httpOnly(true) // JavaScript에서 접근 불가, XSS 공격 방어
                        .secure(true) // HTTPS 환경에서만
                        .path("/") // 쿠키가 전송되는 요청 경로 범위, "/"면 모든 경로
                        .maxAge(refreshTokenValidityInMilliseconds / 1000) // 쿠키 유효 기간
                        .build();

        return ResponseEntity.status(HttpStatus.OK)
                .header(HttpHeaders.SET_COOKIE, newRefreshTokenCookie.toString())
                .body(new BaseResponse<>(loginResponse));
    }

    @PostMapping("/verify/send-code")
    @Operation(summary = "이메일 인증코드 발송")
    public BaseResponse<Void> sendVerificationCode(@RequestBody EmailRequestDto request) {
        emailVerificationService.sendVerificationCode(request.getEmail());

        return new BaseResponse<>();
    }

    @PostMapping("/verify/check-code")
    @Operation(summary = "이메일 인증코드 검증")
    public BaseResponse<Void> verifyCode(@RequestBody EmailVerificationRequestDto request) {
        emailVerificationService.verifyCode(request.getEmail(), request.getCode());

        return new BaseResponse<>();
    }
}
