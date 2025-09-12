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
## Sept. 11

### QueryDSL 개념
- `JPA/Hibernate`: 엔티티 상태 관리와 기본 CRUD, 연관관계, 변경감지 등 “ORM”이 핵심

- `QueryDSL(라이브러리)`: JPQL을 타입세이프한 빌더 문법으로 작성하게 해 주는 도구로 동적 조건, 복잡 조인/집계/서브쿼리를 컴파일 타임 타입체크로 안전하게 다룸

### Q타입
- QueryDSL이 엔티티 클래스를 분석해서 자동 생성하는 메타클래스

- 이름 앞에 Q가 붙어서 나오고, 엔티티 필드를 타입 안전하게 접근할 수 있게함

이렇게 Entity를 작성하면
```Java
@Entity
public class Store {
    @Id
    private Long id;
    private String storeName;
    private String mainCategory;
}
```

빌드 시 `target/generated-sources` 폴더 밑에 생성

```Java
// 자동 생성: QStore.java
public class QStore extends EntityPathBase<Store> {
    public static final QStore store = new QStore("store");

    public final StringPath storeName = createString("storeName");
    public final StringPath mainCategory = createString("mainCategory");
    public final NumberPath<Long> id = createNumber("id", Long.class);
}
```

### Q타입 용도
- `JPAQueryFactory`와 함께 사용해 JPQL을 대체

```Java
JPAQueryFactory query = new JPAQueryFactory(em);
QStore s = QStore.store;

List<Store> results = query
    .selectFrom(s)
    .where(s.mainCategory.eq("FOOD"))
    .orderBy(s.storeName.asc())
    .fetch();
```

- **JPA (JPQL만 사용했을 때)**
    - 문자열 기반이라 IDE에서 필드 오타를 못 잡음
    - 동적 조건이 많아지면 문자열 붙이는 코드가 지저분해짐
```Java
@Query("select s from Store s where s.mainCategory = :cat")
List<Store> findByCategory(@Param("cat") String category);
```

- **QueryDSL**
    - 컴파일 타임에 오류를 잡아줌
    - 동적 쿼리(옵션별 조건 추가)가 깔끔해짐
```Java
QStore s = QStore.store;
query.selectFrom(s)
     .where(s.mainCategory.eq(category))
     .fetch();
```

---
## Sept. 12

### 프로젝트 요구사항
- 본 프로젝트는 상권 빅데이터를 기반으로 한 서비스로, **대용량 데이터 집합**에서 다양한 조건과 조인을 활용한 조회 연산이 핵심
- 데이터는 수정·삭제·추가보다는 **복잡한 조회 및 분석**에 집중

### JDBC/MyBatis의 한계
- **JDBC**: SQL 문자열, 파라미터를 직접 관리해야 해서 보일러플레이트 많고, 타입 안전성 없음. 리팩토링 내구성이 약함
- **MyBatis**: XML/어노테이션 기반으로 SQL 관리가 분산되고, SQL 빌드/조건 분기 코드가 장황해짐. 역시 타입 안전성 부족

### 기존 ORM(JPA/QueryDSL)의 한계
- **JPQL 표현력 한계**: 윈도우 함수, CTE(Common Table Expression), 쿼리 힌트 등 고급 SQL 기능을 지원하지 못하거나 제한적
- **예측 불가능한 SQL 생성**: Hibernate가 JPQL을 SQL로 변환하는 과정에서 의도치 않은 조인이나 서브쿼리가 추가될 수 있어 성능 튜닝이 어려움
- **엔티티 관리 오버헤드**: 조회만 필요한 상황에서도 영속성 컨텍스트 관리, 더티체킹 등 불필요한 부가 작업 발생

### jOOQ 도입 배경
- **SQL 표현력 극대화**  
  - 윈도우 함수, CTE, 서브쿼리, 벤더별 공간 함수 등을 코드로 직접 작성 가능
  - 데이터베이스가 제공하는 기능을 최대한 활용하여 서버 연산 부담을 완화

- **성능 및 튜닝 주도권 확보**  
  - `작성한 DSL 코드 = 실제 실행되는 SQL`이므로 실행 계획을 정확히 예측 가능
  - 인덱스 힌트, 조인 순서 제어 등 DBA와 협업하기 용이

- **대용량 처리 최적화**  
  - JDBC 수준에서 fetch size, streaming cursor를 직접 제어할 수 있어 OutOfMemory 위험을 줄임
  - 엔티티 매핑 대신 DTO로 바로 매핑하여 불필요한 변환 과정을 제거
  - 성능을 DB 엔진의 힘으로 끌어내 I/O 최소화를 통한 속도 개선

- **타입 안정성**  
  - DB 스키마를 기반으로 생성된 코드(Table, Field 클래스)를 사용하므로 컬럼명·타입 변경 시 컴파일 타임에 오류를 검출 가능
  - 런타임 오류 가능성을 줄이고 유지보수성을 높임

---
