package com.ssafy.insite.auth.jwt;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpMethod;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.util.AntPathMatcher;

@RequiredArgsConstructor
public class JwtVerificationFilter extends OncePerRequestFilter {
    private static final String[] PUBLIC = {
            "/v3/api-docs/**",
            "/swagger-ui/**",
            "/swagger-ui.html",
            "/api/v1/auth/login",
            "/api/v1/auth/signup",
            "/api/v1/auth/check/email",
            "/api/v1/auth/check/nickname",
            "/api/v1/auth/verify/send-code",
            "/api/v1/auth/verify/check-code",
            "/api/v1/data/**",
            "/api/v1/ai/**",
            "/api/seoul/**"
    };

    private final JwtTokenProvider jwtTokenProvider;
    private final AntPathMatcher pm = new AntPathMatcher();

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        // 1. Authorization 헤더에서 토큰 추출 ("Bearer " 삭제)
        String bearerToken = request.getHeader("Authorization");
        String token = null;
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            token = bearerToken.substring(7);
        }

        // 2. 토큰 유효성 검사
        if (token != null && jwtTokenProvider.validateToken(token)) { // 만료, 위조 여부 체크
            try {
                // 3. 인증 객체 생성 후 SecurityContextHolder에 등록
                Authentication auth = jwtTokenProvider.getAuthentication(token);

                SecurityContextHolder.getContext().setAuthentication(auth); // SecurityContextHolder에 등록
            } catch (IllegalArgumentException e) {
                // 유효하지 않은 UserType 문자열이 Claims에 있을 경우
                SecurityContextHolder.clearContext();
            }
        }

        // 다음 필터로 요청 전달
        filterChain.doFilter(request, response);
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        // CORS preflight는 항상 스킵
        if (HttpMethod.OPTIONS.matches(request.getMethod())) return true;

        // 공개 URL은 스킵
        String uri = request.getRequestURI();
        for (String p : PUBLIC) {
            if (pm.match(p, uri)) return true;
        }
        return false;
    }
}
