package com.ssafy.insite.common.utils;

public class RedisKeyGenerator {
    private RedisKeyGenerator() {}

    private static final String EMAIL_VERIFIED_PREFIX = "email-verified";
    private static final String EMAIL_VERIFY_CODE_PREFIX = "email-verify-code";
    private static final String REFRESH_TOKEN_PREFIX = "refresh-token";
    private static final String LATEST_QUARTER_PREFIX = "latest-quarter";

    public static String generateEmailVerifiedKey(String email) {
        return new StringBuilder(EMAIL_VERIFIED_PREFIX)
                .append("-").append(email)
                .toString();
    }

    public static String generateEmailVerifyCodeKey(String email) {
        return new StringBuilder(EMAIL_VERIFY_CODE_PREFIX)
                .append("-").append(email)
                .toString();
    }

    public static String generateRefreshTokenKey(String uuid) {
        return new StringBuilder(REFRESH_TOKEN_PREFIX)
                .append("-").append(uuid)
                .toString();
    }

    public static String generateLatestQuarterKey() {
        return LATEST_QUARTER_PREFIX;
    }
}
