package com.ssafy.insite.common.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

@Getter
@AllArgsConstructor
public enum BaseResponseStatus {

    /**
     * 200: 요청 성공
     **/
    SUCCESS(HttpStatus.OK, true, 200, "요청에 성공하였습니다."),
    CREATED(HttpStatus.CREATED, true, 201, "생성에 성공하였습니다."),

    /**
     * 400 : security 에러
     */
    WRONG_JWT_TOKEN(HttpStatus.UNAUTHORIZED, false, 401, "다시 로그인 해주세요"),
    NO_SIGN_IN(HttpStatus.UNAUTHORIZED, false, 402, "로그인을 먼저 진행해주세요"),
    NO_ACCESS_AUTHORITY(HttpStatus.FORBIDDEN, false, 403, "접근 권한이 없습니다"),
    DISABLED_USER(HttpStatus.FORBIDDEN, false, 404, "비활성화된 계정입니다. 계정을 복구하시겠습니까?"),
    FAILED_TO_RESTORE(HttpStatus.INTERNAL_SERVER_ERROR, false, 405, "계정 복구에 실패했습니다. 관리자에게 문의해주세요."),

    /**
     * 900: 기타 에러
     */
    INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, false, 900, "Internal server error"),
    SSE_SEND_FAIL(HttpStatus.INTERNAL_SERVER_ERROR, false, 901, "알림 전송에 실패하였습니다."),
    MAIL_SEND_FAIL(HttpStatus.INTERNAL_SERVER_ERROR, false, 902, "메일 전송에 실패하였습니다."),

    /**
     * 2000: users service error
     */
    TOKEN_NOT_VALID(HttpStatus.UNAUTHORIZED, false, 2001, "토큰이 유효하지 않습니다."),
    DUPLICATED_USER(HttpStatus.CONFLICT, false, 2101, "이미 가입된 사용자입니다."),
    FAILED_TO_LOGIN(HttpStatus.UNAUTHORIZED, false, 2102, "아이디 또는 패스워드를 다시 확인하세요."),
    NO_EXIST_USER(HttpStatus.NOT_FOUND, false, 2105, "존재하지 않는 사용자 정보입니다."),
    PASSWORD_SAME_FAILED(HttpStatus.BAD_REQUEST, false, 2106, "현재 사용중인 비밀번호 입니다."),
    PASSWORD_MATCH_FAILED(HttpStatus.BAD_REQUEST, false, 2108, "패스워드를 다시 확인해주세요."),
    DUPLICATED_NICKNAME(HttpStatus.CONFLICT, false, 2010, "이미 사용중인 닉네임입니다."),
    INVALID_EMAIL_ADDRESS(HttpStatus.BAD_REQUEST, false, 2012, "이메일을 다시 확인해주세요."),
    FAILED_TO_SIGN_UP(HttpStatus.INTERNAL_SERVER_ERROR, false, 2013, "회원가입에 실패했습니다."),
    EMAIL_VERIFICATION_CODE_NOT_FOUND(HttpStatus.UNAUTHORIZED, false, 2015, "인증 코드가 만료되었거나 존재하지 않습니다."),
    EMAIL_VERIFICATION_CODE_MISMATCH(HttpStatus.UNAUTHORIZED, false, 2016, "인증 코드가 일치하지 않습니다."),
    EMAIL_NOT_VERIFIED(HttpStatus.UNAUTHORIZED, false, 2017, "이메일 인증코드를 검증해 주세요."),
    INVALID_BIRTHDATE(HttpStatus.CONFLICT, false, 2018, "생년월일이 올바르지 않습니다."),
    INVALID_DONG(HttpStatus.BAD_REQUEST, false, 2019, "행정동이 존재하지 않습니다."),
    INVALID_QUERY(HttpStatus.BAD_REQUEST, false, 2020, "검색 조건이 유효하지 않습니다."),
    INVALID_TRDAR_CD(HttpStatus.BAD_REQUEST, false, 2021, "상권 코드가 유효하지 않습니다."),
    INVALID_TRDAR_CD_NM(HttpStatus.BAD_REQUEST, false, 2022, "상권명이 유효하지 않습니다."),
    DUPLICATE_FAVORITE(HttpStatus.CONFLICT, false, 4885, "이미 추가된 상권입니다."),
    FAVORITE_NOT_FOUND(HttpStatus.BAD_REQUEST, false, 4885, "존재하지 않는 상권입니다."),
    SUMMARY_NOT_FOUND(HttpStatus.BAD_REQUEST, false, 4885, "상권 요약 데이터가 갱신되지 않았습니다.")
    ;

    private final HttpStatusCode httpStatusCode;
    private final boolean isSuccess;
    private final int code;
    private final String message;
}
