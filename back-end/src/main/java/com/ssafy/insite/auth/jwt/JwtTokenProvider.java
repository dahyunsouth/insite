package com.ssafy.insite.auth.jwt;

import com.ssafy.insite.auth.service.CustomUserDetailsService;
import com.ssafy.insite.common.enums.UserType;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import java.security.Key;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class JwtTokenProvider {

    @Value("${jwt.secret-key}")
    private String secretKeyString;

    @Value("${jwt.access-expire-time}")
    private long accessTokenValidityInMilliseconds;

    @Value("${jwt.refresh-expire-time}")
    private long refreshTokenValidityInMilliseconds;

    private final CustomUserDetailsService customUserDetailsService;

    private Key secretKey;

    @PostConstruct
    protected void init() {
        this.secretKey = Keys.hmacShaKeyFor(secretKeyString.getBytes());
    }

    // 액세스 토큰 생성
    public String generateAccessToken(String uuid, UserType role) {
        Claims claims = Jwts.claims();
        claims.put("uuid", uuid);
        claims.put("role", role);

        Date now = new Date();
        Date expiry = new Date(now.getTime() + accessTokenValidityInMilliseconds);

        return Jwts.builder()
                .setClaims(claims)
                .setIssuedAt(now)
                .setExpiration(expiry)
                .signWith(secretKey, SignatureAlgorithm.HS256)
                .compact();
    }

    // 리프레시 토큰 생성
    public String generateRefreshToken(String userUuid) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + refreshTokenValidityInMilliseconds);

        return Jwts.builder()
                .setSubject("refreshToken")
                .claim("uuid", userUuid)
                .setIssuedAt(now)
                .setExpiration(expiry)
                .signWith(secretKey, SignatureAlgorithm.HS256)
                .compact();
    }

    // 토큰에서 클레임 추출
    public Claims getClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(secretKey)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    // 토큰 유효성 검사
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(secretKey).build().parseClaimsJws(token);
            /*
            parseClaimsJws()는 아래 내용을 자동으로 수행
            - JWT 서명 검증
            - exp(만료시간) 검사 -> 만료 시 ExpiredJwtException 발생
             */
            return true;
        } catch (SecurityException | MalformedJwtException | ExpiredJwtException |
                 UnsupportedJwtException | IllegalArgumentException e) {
            return false;
        }
    }

    public List<GrantedAuthority> getAuthorities(UserType userType) {
        // 권한 이름 앞에 ROLE_ 접두어 붙이기 (Spring Security 규칙)
        String roleName = "ROLE_" + userType.name();

        // 단일 권한만 갖는 사용자에 대해 리스트로 래핑
        return Collections.singletonList(new SimpleGrantedAuthority(roleName));
    }

    // JWT 토큰을 파싱해 Authentication 객체로 변환
    public Authentication getAuthentication(String token) {
        /*
        Authentication 객체: Spring Security 가 사용자의 인증 정보를 담는 기본 객체
        - principal :	사용자 식별자 (우리는 uuid)
        - credentials :	비밀번호 (우리는 필요X)
        - authorities :	권한 목록 (예: [ROLE_FAN])
         */

        // 1. 토큰에서 Claims 추출
        Claims claims = getClaims(token);

        // 2. 클레임에서 사용자 UUID 꺼내기
        String uuid = claims.get("uuid", String.class);

        // 3. DB에서 UserDetails 로드
        UserDetails userDetails = customUserDetailsService.loadUserByUuid(uuid);

        return new UsernamePasswordAuthenticationToken(userDetails, token, userDetails.getAuthorities());
    }
}
