# TODAY I LEARNED
  
**작성자**: 정필교  
**PJT 식별자**: S13P21E203  
  
---
## Sept. 8

### `@Transactional` 어노테이션을 붙이는 기준
- JPA/Hibernate는 트랜잭션 안에서만 안전하게 DB 작업이 가능함
- 보통 Service 계층 메서드에 붙이고 Controller에는 붙이지 않음  
`Controller → Service(@Transactional) → Repository`

- **어노테이션 필수**
    - save, update, delete, remove 같은 쓰기 작업
    - 여러 DB 작업이 하나의 단위로 묶여야 할 때 (원자성)
    - Lazy 로딩 엔티티를 서비스 계층에서 끝까지 사용해야 할 때

- **어노테이션 비필수**
    - 단순 조회(read-only)만 하는 경우 (성능을 위해 `@Transactional(readOnly = true)`를 붙여도 됨)
    
---
## Sept. 9

### Spring Security 공개 엔드포인트 처리
- **문제상황**
    - `/api/v1/auth/check/email` 같은 공개 API를 호출할 때도 Authorization 헤더가 붙으면 JWT 필터가 토큰 검증을 시도함
    - DB에 해당 UUID가 없거나 토큰이 유효하지 않으면 401/403 예외 발생

- **원인분석**
    - SecurityConfig의 `permitAll()`은 인가(Authorization) 단계에서 적용되나, JWT 필터는 인증(Authentication) 단계에서 먼저 실행
    - 즉, 필터가 토큰을 보고 예외를 던져버리면 `permitAll()`까지 가지 못함

- **해결방법**
    - `OncePerRequestFilter`의 `shouldNotFilter()`를 오버라이드하여, CORS Preflight, 공개 API는 필터를 스킵하도록 설정
    - 토큰이 없으면 그냥 체인을 타고 넘어가고, 유효한 토큰에 한해 인증 객체를 생성 및 저장하도록 수정

- **배운 점**
    - `SecurityConfig permitAll()`: 인증 끝난 뒤 권한 검사를 하지 않음
    - `Filter 화이트리스트`: 이 요청은 인증 과정 자체를 생략

---
