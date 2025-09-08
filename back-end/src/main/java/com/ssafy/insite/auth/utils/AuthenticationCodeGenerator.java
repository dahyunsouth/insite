package com.ssafy.insite.auth.utils;

public class AuthenticationCodeGenerator {
    public static String generateCode() {
        StringBuilder code = new StringBuilder();
        for (int i = 0; i < 6; i++) {
            int digit = (int) (Math.random() * 10); // 0~9
            code.append(digit);
        }
        return code.toString();
    }
}
