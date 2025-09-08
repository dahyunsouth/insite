# TODAY I LEARNED
  
**작성자**: 정필교  
**PJT 식별자**: S13P21E203  
  
---
### Sept. 8

`@Transactional` 어노테이션을 붙이는 기준
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
