package com.ssafy.insite.common.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.insite.auth.jwt.JwtTokenProvider;
import com.ssafy.insite.auth.jwt.JwtVerificationFilter;
import com.ssafy.insite.common.dto.response.BaseResponse;
import com.ssafy.insite.common.dto.response.BaseResponseStatus;
import jakarta.servlet.http.HttpServletResponse;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@RequiredArgsConstructor
@EnableMethodSecurity(prePostEnabled = true) // @PreAuthorize 사용 위해
public class SecurityConfig {
    private final JwtTokenProvider jwtTokenProvider;
    @Bean
    public PasswordEncoder passwordEncoder() { // 비밀번호 암호화(BCrypt 해시)
        return new BCryptPasswordEncoder();
        /*
        평문 비밀번호 암호화: String encoded = passwordEncoder.encode("password123!");
        평문 및 암호화된 비밀번호 비교: boolean isMatch = passwordEncoder.matches("password123!", encoded);
         */
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(request -> {
                    var config = new org.springframework.web.cors.CorsConfiguration();
                    config.setAllowedOrigins(List.of(
                            "http://localhost:3000",
                            "http://43.203.196.29:8080",
                            "https://j13e203.p.ssafy.io/"
                    ));
                    config.setAllowedMethods(List.of("*"));
                    config.setAllowedHeaders(List.of("*"));
                    config.setAllowCredentials(true);
                    return config;
                }))
                .csrf(csrf -> csrf.disable())        // CSRF 비활성화 (쿠키 기반 인증이 아님)
                .formLogin(form -> form.disable())   // 기본 로그인 폼 비활성화
                .httpBasic(basic -> basic.disable()) // HTTP 기본 인증 비활성화
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)) // 세션 사용 안 함
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/v3/api-docs/**",
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/api/v1/auth/**",
                                "/api/v1/data/**",
                                "/api/v1/ai/**",
                                "/api/seoul/**"
                        ).permitAll()
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll() // Preflight 허용 (OPTIONS 요청 허용)
                        .anyRequest().authenticated()) // 그 외 인증 필요
                .exceptionHandling(exception -> exception
                        .authenticationEntryPoint((request, response, authException) -> { // 인증 실패 시 (로그인 필요)
                            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                            response.setContentType("application/json;charset=UTF-8");
                            response.getWriter().write(new ObjectMapper().writeValueAsString(
                                    new BaseResponse<>(BaseResponseStatus.NO_ACCESS_AUTHORITY)
                            ));
                        })
                        .accessDeniedHandler((request, response, accessDeniedException) -> { // 인가 실패 시 (권한이 없는 경우)
                            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                            response.setContentType("application/json;charset=UTF-8");
                            response.getWriter().write(new ObjectMapper().writeValueAsString(
                                    new BaseResponse<>(BaseResponseStatus.NO_ACCESS_AUTHORITY)
                            ));
                        })
                )
                .addFilterBefore(new JwtVerificationFilter(jwtTokenProvider),
                        UsernamePasswordAuthenticationFilter.class); // JWT 필터 추가
        // JwtVerificationFilter에서 이미 인증객체를 저장했으므로 UsernamePasswordAuthenticationFilter는 그냥 통과됨

        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
