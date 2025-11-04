# Receiptify Backend

## 프로젝트 개요
Receiptify는 개인 가계부 관리 애플리케이션의 백엔드 서버입니다. Express.js와 TypeScript를 기반으로 구축되었으며, SQLite 데이터베이스를 사용합니다.

**중요**:
- 기능 개발 시 [USER_STORIES.md](../docs/USER_STORIES.md)를 반드시 참조하여 요구사항 및 구현 상태를 확인하세요.
- API 개발 완료 시 [API_SPECIFICATION.md](../docs/API_SPECIFICATION.md)에 상세 스펙을 반드시 추가하세요.

## 기술 스택
- **프레임워크**: Express.js 5.1.0
- **언어**: TypeScript 5.8.3
- **데이터베이스**: SQLite3 (better-sqlite3)
- **인증**: JWT (jsonwebtoken)
- **문서화**: Swagger UI
- **보안**: bcryptjs, CORS
- **개발 도구**: nodemon, tsx

## 프로젝트 구조
```
backend/
├── data/                   # SQLite 데이터베이스 파일
│   └── receiptify.db      # 메인 데이터베이스
├── src/
│   ├── config/            # 설정 파일
│   │   ├── database.ts    # 데이터베이스 연결 및 초기화
│   │   └── swagger.ts     # Swagger 설정
│   ├── controllers/       # 컨트롤러 (요청 처리)
│   │   ├── asset.controller.ts     # 자산 관리
│   │   ├── category.controller.ts  # 카테고리 관리
│   │   └── user.controller.ts      # 사용자 인증
│   ├── errors/            # 에러 처리
│   │   ├── app.error.ts   # 앱 전용 에러
│   │   ├── base.error.ts  # 기본 에러 클래스
│   │   └── specific.error.ts # 특정 에러 타입
│   ├── middlewares/       # 미들웨어
│   │   ├── auth.middleware.ts  # 인증 미들웨어
│   │   └── error.handler.ts    # 에러 핸들러
│   ├── models/            # 데이터베이스 모델
│   │   ├── asset.model.ts      # 자산 모델
│   │   ├── category.model.ts   # 카테고리 모델
│   │   ├── receipt.model.ts    # 가계부 내역 모델
│   │   └── user.model.ts       # 사용자 모델
│   ├── routes/            # API 라우트 정의
│   │   ├── asset.route.ts      # 자산 관련 라우트
│   │   ├── category.route.ts   # 카테고리 관련 라우트
│   │   └── user.route.ts       # 인증 관련 라우트
│   ├── services/          # 비즈니스 로직
│   │   ├── asset.service.ts    # 자산 서비스
│   │   ├── category.service.ts # 카테고리 서비스
│   │   ├── receipt.service.ts  # 가계부 내역 서비스
│   │   └── user.service.ts     # 사용자 서비스
│   ├── swagger/           # Swagger 문서
│   │   └── schemas.yaml   # API 스키마 정의
│   ├── types/             # TypeScript 타입 정의
│   │   ├── asset.type.ts       # 자산 타입
│   │   ├── category.type.ts    # 카테고리 타입
│   │   ├── express.type.ts     # Express 확장 타입
│   │   ├── receipt.type.ts     # 가계부 내역 타입
│   │   └── user.type.ts        # 사용자 타입
│   ├── utils/             # 유틸리티 함수
│   │   └── jwt.util.ts    # JWT 토큰 관련 유틸
│   └── server.ts          # 서버 진입점
├── package.json           # 프로젝트 의존성
└── tsconfig.json         # TypeScript 설정
```

## 주요 명령어
```bash
# 개발 서버 실행 (핫 리로드)
npm run dev

# TypeScript 빌드
npm run build

# 프로덕션 서버 실행
npm run start
```

## API 엔드포인트
서버는 기본적으로 5000번 포트에서 실행됩니다.

### 인증 (Auth)
- `POST /api/auth/register` - 회원가입
- `POST /api/auth/login` - 로그인

### 자산 (Asset)
- `GET /api/asset` - 자산 목록 조회 (인증 필요)
- `POST /api/asset` - 자산 추가 (인증 필요)
- `PUT /api/asset/:id` - 자산 수정 (인증 필요)
- `DELETE /api/asset/:id` - 자산 삭제 (인증 필요)

### 카테고리 (Category)
- `GET /api/category` - 카테고리 목록 조회 (인증 필요)
- `POST /api/category` - 카테고리 추가 (인증 필요)
- `PUT /api/category/:id` - 카테고리 수정 (인증 필요)
- `DELETE /api/category/:id` - 카테고리 삭제 (인증 필요)

### 가계부 내역 (Receipt)
- `GET /api/receipt` - 거래 내역 조회 (인증 필요)
- `POST /api/receipt` - 거래 내역 추가 (인증 필요)
- `PUT /api/receipt/:id` - 거래 내역 수정 (인증 필요)
- `DELETE /api/receipt/:id` - 거래 내역 삭제 (인증 필요)

## 데이터베이스 스키마

### users (사용자)
- id: 고유 식별자
- email: 이메일 (유니크)
- password: 암호화된 비밀번호
- name: 사용자 이름
- created_at: 생성 시간

### assets (자산)
- id: 고유 식별자
- name: 자산 이름
- type: 자산 유형 ('card', 'account')
- balance: 잔액
- user_id: 사용자 ID (외래키)
- created_at, updated_at: 생성/수정 시간

### categories (카테고리)
- id: 고유 식별자
- parent_id: 부모 카테고리 ID (계층 구조)
- name: 카테고리 이름
- type: 카테고리 유형 (0: 지출, 1: 수입)
- level: 계층 레벨 (1, 2, 3)
- user_id: 사용자 ID (외래키)

### receipts (가계부 내역)
- id: 고유 식별자
- type: 거래 유형 (0: 지출, 1: 수입, 2: 이체)
- cost: 금액
- content: 내용
- location: 장소
- user_id: 사용자 ID (외래키)
- asset_id: 자산 ID (외래키)
- trs_asset_id: 이체 대상 자산 ID (이체시에만)
- category_id: 카테고리 ID (외래키)
- created_at, updated_at: 생성/수정 시간

### statistics (통계)
- id: 고유 식별자
- total_amount: 총액
- month: 월
- year: 년도
- asset_id: 자산 ID (외래키)
- created_at, updated_at: 생성/수정 시간

## 주요 기능

> 상세한 기능 명세는 [USER_STORIES.md](../docs/USER_STORIES.md)를 참조하세요.
> API 상세 스펙은 [API_SPECIFICATION.md](../docs/API_SPECIFICATION.md)를 참조하세요.

### 1. 사용자 관리 ✅
**구현 상태: 완료**

- ✅ 회원가입 (`POST /api/auth/register`)
  - 이메일 형식 검증
  - 비밀번호 강도 검증 (최소 8자, 영문/숫자 조합)
  - 중복 이메일 체크
  - 비밀번호 bcrypt 해싱

- ✅ 로그인 (`POST /api/auth/login`)
  - 이메일/비밀번호 인증
  - JWT 토큰 발급
  - 로그인 실패 시 명확한 오류 메시지

- ❌ 비밀번호 변경 (미구현)
- ❌ 회원 탈퇴 (미구현)

### 2. 자산 관리 ✅
**구현 상태: 완료**

- ✅ 자산 추가 (`POST /api/asset`)
  - 자산 이름, 유형(계좌/카드), 초기 잔액 설정
  - 중복 이름 체크
  - 사용자별 자산 분리

- ✅ 자산 목록 조회 (`GET /api/asset`)
  - 사용자별 자산 목록 조회
  - 자산 유형별 표시

- ✅ 자산 상세 조회 (`GET /api/asset/:id`)
  - 특정 자산 정보 조회

- ✅ 자산 수정 (`PUT /api/asset/:id`)
  - 자산 이름, 유형, 잔액 수정
  - 소유권 검증

- ✅ 자산 삭제 (`DELETE /api/asset/:id`)
  - 자산 삭제
  - 소유권 검증

- ✅ 총 자산 조회 (`GET /api/asset/total`)
  - 모든 자산 잔액 합계 계산

### 3. 카테고리 관리 ✅
**구현 상태: 완료**

- ✅ 카테고리 추가 (`POST /api/category`)
  - 카테고리 이름, 유형(수입/지출), 부모 카테고리 설정
  - 3단계 계층 구조 지원 (1단계 > 2단계 > 3단계)
  - 중복 이름 체크

- ✅ 카테고리 목록 조회 (`GET /api/category`)
  - 사용자별 카테고리 목록 조회
  - 수입/지출 카테고리 분리
  - 계층 구조 정보 포함

- ✅ 카테고리 수정 (`PUT /api/category/:id`)
  - 카테고리 이름, 부모 카테고리 변경
  - 소유권 검증

- ✅ 카테고리 삭제 (`DELETE /api/category/:id`)
  - 카테고리 삭제
  - 소유권 검증

- ❌ 기본 카테고리 자동 생성 (미구현)

### 4. 가계부 내역 관리 🔧
**구현 상태: 백엔드 완료, 프론트엔드 부분 구현**

- ✅ 지출 내역 추가 (`POST /api/receipt`, type: 0)
  - 금액, 자산, 카테고리, 내용, 장소 기록
  - 자산 잔액 자동 차감

- ✅ 수입 내역 추가 (`POST /api/receipt`, type: 1)
  - 금액, 자산, 카테고리, 내용 기록
  - 자산 잔액 자동 증가

- ✅ 이체 내역 추가 (`POST /api/receipt`, type: 2)
  - 출금 자산, 입금 자산(trs_asset_id), 금액 기록
  - 출금 자산 잔액 차감, 입금 자산 잔액 증가

- ✅ 거래 내역 조회 (`GET /api/receipt`)
  - 사용자별 거래 내역 조회
  - 시간순 정렬

- ✅ 거래 내역 상세 조회 (`GET /api/receipt/:id`)
  - 특정 거래의 상세 정보 조회

- ✅ 거래 내역 수정 (`PUT /api/receipt/:id`)
  - 모든 필드 수정 가능
  - 금액 수정 시 자산 잔액 자동 조정
  - 소유권 검증

- ✅ 거래 내역 삭제 (`DELETE /api/receipt/:id`)
  - 거래 삭제 시 자산 잔액 자동 복구
  - 소유권 검증

- ❌ 반복 거래 등록 (미구현)

### 5. 통계 및 분석 ⏳
**구현 상태: 부분 구현**

- 🔧 Statistics 테이블 존재
- ❌ 월별 지출 통계 API (미구현)
- ❌ 카테고리별 지출 분석 API (미구현)
- ❌ 수입 vs 지출 비교 API (미구현)
- ❌ 자산별 거래 통계 API (미구현)
- ❌ 일별 지출 캘린더 API (미구현)

### 6. 검색 및 필터링 ❌
**구현 상태: 미구현**

- ❌ 거래 내역 검색 (키워드 기반)
- ❌ 기간별 필터링
- ❌ 카테고리별 필터링
- ❌ 자산별 필터링
- ❌ 금액 범위 필터링

### 7. 예산 관리 ❌
**구현 상태: 미구현**

- ❌ 월별 예산 설정
- ❌ 예산 사용 현황 조회
- ❌ 예산 초과 경고

### 8. 알림 및 리마인더 ❌
**구현 상태: 미구현**

- ❌ 정기 지출 알림
- ❌ 목표 달성 알림
- ❌ 예산 알림

### 9. 데이터 관리 ❌
**구현 상태: 미구현**

- ❌ 데이터 백업 (CSV, Excel 내보내기)
- ❌ 데이터 복원
- ❌ 데이터 내보내기 (특정 기간)
- ❌ 데이터 가져오기

### 10. 영수증 OCR 스캔 (주요 기능) ❌
**구현 상태: 미구현**

> **핵심 차별화 기능**: 영수증 사진 업로드 → 자동 텍스트 추출 → 품목별 분류 → 거래 내역 등록

- ❌ 영수증 이미지 업로드 API
- ❌ OCR 텍스트 추출 (Google Cloud Vision API / Tesseract.js / Clova OCR)
- ❌ 영수증 데이터 파싱 및 구조화
- ❌ 품목 자동 카테고리 분류
- ❌ 품목별 거래 내역 일괄 등록

**OCR 기능 구현 시 고려사항:**
- OCR 엔진 선택 및 통합
- 이미지 전처리 (회전, 자르기, 화질 개선)
- 한글/영문/숫자 인식률 최적화
- 영수증 형식별 파싱 로직
- 품목 카테고리 매핑 알고리즘

### 11. API 문서화 ✅
- Swagger UI 통합 (`/api-docs`)
- 모든 엔드포인트 자동 문서화
- 요청/응답 스키마 정의

## 보안 기능
- CORS 설정 (localhost:3000만 허용)
- JWT 토큰 인증
- 비밀번호 해싱 (bcrypt)
- SQL 인젝션 방지 (prepared statements)
- 사용자별 데이터 접근 제어

## 개발 환경 설정
1. Node.js 18+ 설치
2. `npm install`로 의존성 설치
3. `.env` 파일 생성 (필요시)
4. `npm run dev`로 개발 서버 시작

## 성능 최적화
- SQLite WAL 모드 사용
- 주요 쿼리에 인덱스 적용
- 트랜잭션을 사용한 원자적 연산
- Prepared statements 캐싱

## 에러 처리
- 계층적 에러 클래스 구조
- 중앙화된 에러 핸들러
- 명확한 에러 메시지와 상태 코드
- 커스텀 에러 타입 지원

---

## 개발 규칙 (Coding Conventions)

### 1. 아키텍처 패턴
프로젝트는 **계층형 아키텍처 (Layered Architecture)** 를 따릅니다.

```
Route → Controller → Service → Model → Database
```

#### 각 계층의 역할
- **Route**: API 엔드포인트 정의, 미들웨어 적용
- **Controller**: HTTP 요청/응답 처리, 입력 검증, 에러 핸들링
- **Service**: 비즈니스 로직 구현, 트랜잭션 관리
- **Model**: 데이터베이스 쿼리 실행, CRUD 작업

### 2. 파일 및 네이밍 규칙

#### 파일명
- 모든 파일은 **소문자 + 케밥 케이스**로 작성
- 타입별 접미사 사용:
  ```
  *.controller.ts  # 컨트롤러
  *.service.ts     # 서비스
  *.model.ts       # 모델
  *.route.ts       # 라우트
  *.type.ts        # 타입 정의
  *.middleware.ts  # 미들웨어
  *.util.ts        # 유틸리티
  ```

#### 클래스명
- **PascalCase** 사용
- 명확한 역할 표시:
  ```typescript
  AssetController
  AssetService
  AssetModel
  ```

#### 메서드명
- **camelCase** 사용
- CRUD 작업은 표준 메서드명 사용:
  ```typescript
  create()     // 생성
  get()        // 단일 조회
  getList()    // 목록 조회
  update()     // 수정
  delete()     // 삭제
  ```

#### 변수명
- **camelCase** 사용
- 명확하고 설명적인 이름 사용
- 약어 지양 (특수한 경우 제외)

### 3. TypeScript 규칙

#### 타입 정의
- 모든 함수의 매개변수와 반환값에 타입 명시
- `types/` 디렉토리에 도메인별 타입 정의
- 인터페이스 정의 시 명확한 이름 사용:
  ```typescript
  interface Asset {}          // 엔티티
  interface CreateDTO {}      // 생성 DTO
  interface UpdateDTO {}      // 수정 DTO
  ```

#### any 타입 사용 금지
- `any` 대신 적절한 타입 정의 또는 `unknown` 사용
- 불가피한 경우 주석으로 이유 명시

#### Null/Undefined 처리
- Optional 필드는 `?` 사용
- Null 체크 후 로직 처리
- Undefined 반환 가능성이 있으면 타입에 명시:
  ```typescript
  findById(id: number): Promise<Asset | undefined>
  ```

### 4. Controller 작성 규칙

#### 기본 구조
```typescript
static async methodName(req: Request, res: Response, next: NextFunction) {
    try {
        // 1. 파라미터 추출 및 변환
        const id = Number(req.params.id);
        const userId = Number(req.user?.userId);

        // 2. 입력 검증
        if (!name || !type) {
            throw createError.validation('필드명');
        }

        // 3. 서비스 호출
        const result = await Service.method(data);

        // 4. 응답 반환
        res.status(200).json({
            success: true,
            data: result,
            message: '성공 메시지' // 선택사항
        });
    } catch (error) {
        // 5. 에러 처리 위임
        next(error);
    }
}
```

#### 입력 검증
- 필수 필드 검증
- 데이터 타입 검증
- 범위/형식 검증
- 검증 실패 시 `createError.validation()` 사용

#### 응답 형식
모든 API 응답은 일관된 형식 사용:
```typescript
{
    success: boolean,      // 성공 여부
    data?: any,           // 응답 데이터
    message?: string      // 메시지 (선택)
}
```

#### HTTP 상태 코드
- `200`: 조회/수정/삭제 성공
- `201`: 생성 성공
- `400`: 잘못된 요청
- `401`: 인증 실패
- `403`: 권한 없음
- `404`: 리소스 없음
- `500`: 서버 에러

### 5. Service 작성 규칙

#### 기본 구조
```typescript
static async methodName(data: DTO): Promise<ReturnType> {
    // 1. 비즈니스 로직 검증
    await this.validateBusinessRules(data);

    // 2. 데이터베이스 작업
    const result = await Model.operation(data);

    // 3. 결과 검증
    if (!result) {
        throw createError.notFound('리소스명');
    }

    // 4. 결과 반환
    return result;
}
```

#### 책임 범위
- 비즈니스 로직 구현
- 데이터 검증 및 변환
- 트랜잭션 관리
- 여러 Model 호출 조율
- 에러 생성 및 발생

#### Private 메서드
- 재사용 가능한 검증 로직은 private 메서드로 분리:
  ```typescript
  private static async checkDuplicateName(name: string, userId: number): Promise<void>
  private static async verifyOwnership(id: number, userId: number): Promise<Asset>
  ```

### 6. Model 작성 규칙

#### 기본 구조
```typescript
static async methodName(param: Type): Promise<ReturnType> {
    const stmt = db.prepare(`
        SQL 쿼리
    `);
    const result = stmt.run(param) | stmt.get(param) | stmt.all(param);
    return result as ReturnType;
}
```

#### SQL 작성 규칙
- **Prepared Statements 필수 사용** (SQL Injection 방지)
- Named parameters 사용 (`@name`) 또는 positional (`?`)
- 읽기 쉽도록 멀티라인으로 작성
- 적절한 인덱스 활용
- 복잡한 쿼리는 주석으로 설명 추가

#### CRUD 메서드 표준
```typescript
create(data: CreateDTO): Promise<{changes: number, lastInsertRowid: number | bigint}>
findById(id: number): Promise<Entity | undefined>
findByUserId(userId: number): Promise<Entity[]>
update(data: UpdateDTO): Promise<number>  // returns changes count
delete(id: number): Promise<number>       // returns changes count
```

### 7. 에러 처리 규칙

#### 에러 생성
`createError` 유틸리티 사용:
```typescript
createError.validation('필드명')           // 400
createError.notFound('리소스명')           // 404
createError.duplicate('리소스명')          // 409
createError.permission('리소스명')         // 403
createError.createFailed('리소스명')       // 500
createError.updateFailed('리소스명')       // 500
createError.deleteFailed('리소스명')       // 500
```

#### 에러 처리 위치
- **Controller**: 입력 검증 에러
- **Service**: 비즈니스 로직 에러
- **Model**: 데이터베이스 제약 조건 에러
- 모든 에러는 `next(error)`로 전달하여 중앙 에러 핸들러에서 처리

### 8. 보안 규칙

#### 인증/인가
- 보호된 라우트는 `authenticateToken` 미들웨어 사용
- `req.user.userId`로 인증된 사용자 정보 접근
- 모든 사용자 데이터 접근 시 소유권 검증 필수

#### 데이터 보안
- 비밀번호는 bcrypt로 해싱 (최소 10 rounds)
- JWT 토큰에 민감한 정보 포함 금지
- SQL Injection 방지 (Prepared Statements)
- XSS 방지 (입력값 검증)

#### CORS
- 개발 환경: `http://localhost:3000` 허용
- 프로덕션: 실제 도메인으로 변경 필요

### 9. 데이터베이스 규칙

#### 네이밍
- 테이블명: 복수형, 소문자, 언더스코어 (`users`, `assets`)
- 컬럼명: 소문자, 언더스코어 (`user_id`, `created_at`)
- 외래키: `{테이블명}_id` 형식

#### 타임스탬프
- `created_at`: 생성 시간 (DEFAULT CURRENT_TIMESTAMP)
- `updated_at`: 수정 시간 (트리거로 자동 업데이트)

#### 인덱스
- 외래키 컬럼에 인덱스 생성
- 자주 검색되는 컬럼에 인덱스 추가
- 복합 인덱스 고려

### 10. 개발 주의사항

#### 기존 코드 분석 및 일관성 유지
- **새로운 기능을 개발하기 전에 반드시 기존 코드를 분석**하여 패턴과 구조를 파악하세요
- 기존 코드의 네이밍 컨벤션, 파일 구조, 아키텍처 패턴을 따라야 합니다
- 비슷한 기능이 이미 구현되어 있다면, 그 구현 방식을 참고하여 일관성을 유지하세요
- 예: 자산 관리 기능을 참고하여 카테고리 관리 기능을 구현할 때, Controller-Service-Model 패턴, 에러 처리 방식, 응답 포맷 등을 동일하게 유지

#### Mock 데이터 및 가짜 구현 금지
- **절대로 Mock 데이터나 하드코딩된 가짜 데이터를 반환하지 마세요**
- 모든 API는 실제 데이터베이스와 연동되어야 합니다
- 임시 구현이나 TODO로 남기지 말고, 완전한 기능을 구현하세요
- 테스트용 더미 데이터가 필요하다면 별도의 seed 스크립트로 분리하세요
- 예시 - ❌ 잘못된 구현:
  ```typescript
  static async getList(): Promise<Asset[]> {
    // TODO: 나중에 구현
    return [
      { id: 1, name: "테스트 자산", type: "card", balance: 100000 }
    ];
  }
  ```
- 예시 - ✅ 올바른 구현:
  ```typescript
  static async getList(userId: number): Promise<Asset[]> {
    return await AssetModel.findByUserId(userId);
  }
  ```

#### 테스트 가능한 구조로 설계
- 각 계층(Controller, Service, Model)의 책임을 명확히 분리하세요
- 비즈니스 로직은 Service 레이어에 집중시켜 테스트하기 쉽게 만드세요
- 외부 의존성(데이터베이스, API 등)은 주입 가능하도록 설계하세요
- 순수 함수로 작성 가능한 로직은 별도 유틸리티로 분리하세요
- Model 메서드는 단일 책임 원칙을 따라 작은 단위로 분리하세요
- 예: 복잡한 비즈니스 로직을 Service에서 여러 개의 작은 private 메서드로 분해

### 11. 코드 품질

#### 주석

##### 파일 헤더 주석
모든 파일 상단에 다음 형식의 헤더 주석 추가:

```typescript
/**
 * 파일명: asset.service.ts
 * 설명: 자산 관리 비즈니스 로직 처리
 * 작성일: 2024-01-15
 * 작성자: 개발자명
 *
 * 수정 이력:
 * - 2024-01-20: 총 자산 조회 기능 추가 (개발자명)
 * - 2024-01-25: 소유권 검증 로직 개선 (개발자명)
 */
```

##### 함수/메서드 주석
public 메서드에는 JSDoc 형식으로 주석 작성:

```typescript
/**
 * 자산을 생성합니다.
 *
 * @param assetData - 생성할 자산 정보
 * @returns 생성된 자산 객체
 * @throws {ValidationError} 필수 필드 누락 시
 * @throws {DuplicateError} 동일한 이름의 자산이 이미 존재할 시
 *
 * @example
 * const asset = await AssetService.create({
 *   name: '신한카드',
 *   type: 'card',
 *   balance: 100000,
 *   user_id: 1
 * });
 */
static async create(assetData: CreateDTO): Promise<Asset> {
    // 구현...
}
```

##### 복잡한 로직 주석
복잡한 비즈니스 로직이나 알고리즘에는 설명 추가:

```typescript
// 1단계: 기존 잔액 조회
const oldBalance = await AssetModel.getBalance(assetId);

// 2단계: 거래 타입에 따른 잔액 계산
// - 지출(0): 잔액 감소
// - 수입(1): 잔액 증가
// - 이체(2): 출금 자산 감소, 입금 자산 증가
const newBalance = type === 0
    ? oldBalance - amount
    : oldBalance + amount;

// 3단계: 업데이트된 잔액 저장
await AssetModel.updateBalance(assetId, newBalance);
```

##### TODO/FIXME 태그
```typescript
// TODO: 캐싱 로직 추가 필요 (2024-01-15, 개발자명)
// FIXME: 동시성 문제 해결 필요 (2024-01-20, 개발자명)
// HACK: 임시 해결책, 추후 리팩토링 필요 (2024-01-25, 개발자명)
// NOTE: 이 로직은 성능상 중요하므로 수정 시 주의
// OPTIMIZE: 쿼리 최적화 가능 (N+1 문제)
```

##### 수정 이력 주석
중요한 로직 수정 시 인라인 주석으로 기록:

```typescript
static async update(assetData: UpdateDTO, userId: number): Promise<Asset> {
    // [2024-01-20] 소유권 검증 로직 추가 - 보안 강화
    await this.verifyOwnership(assetData.id, userId);

    // [2024-01-25] 트랜잭션 처리 추가 - 데이터 일관성 보장
    const result = await db.transaction(() => {
        return AssetModel.update(assetData);
    });

    return result;
}
```

##### 데이터베이스 쿼리 주석
복잡한 SQL 쿼리에는 설명 추가:

```typescript
static async getMonthlyStatistics(userId: number, year: number, month: number) {
    const stmt = db.prepare(`
        -- 월별 카테고리별 지출 통계 조회
        -- 사용자의 특정 월 거래 내역을 카테고리별로 집계
        SELECT
            c.name AS category_name,
            SUM(r.cost) AS total_amount,
            COUNT(*) AS transaction_count
        FROM receipts r
        JOIN categories c ON r.category_id = c.id
        WHERE r.user_id = @userId
          AND strftime('%Y', r.created_at) = @year
          AND strftime('%m', r.created_at) = @month
          AND r.type = 0  -- 지출만
        GROUP BY c.id
        ORDER BY total_amount DESC
    `);

    return stmt.all({ userId, year: year.toString(), month: month.toString().padStart(2, '0') });
}
```

##### 주석 작성 가이드라인
1. **명확성**: 코드가 "무엇을" 하는지보다 "왜" 하는지 설명
2. **간결성**: 불필요한 주석 지양 (코드로 설명 가능한 경우)
3. **최신성**: 코드 수정 시 관련 주석도 함께 업데이트
4. **한글 사용**: 팀 내부 프로젝트이므로 한글 주석 권장
5. **날짜 형식**: YYYY-MM-DD 형식 사용

##### 주석이 불필요한 경우
```typescript
// 나쁜 예: 코드가 이미 명확함
// userId를 1로 설정
const userId = 1;

// 좋은 예: 코드만으로 이해 가능
const userId = 1;
```

##### API 문서화
- API 문서는 Swagger/OpenAPI로 관리
- `swagger/schemas.yaml` 파일에 정의
- 엔드포인트, 요청/응답 스키마, 에러 코드 명시

#### 로깅
- 개발 중 디버깅용 `console.log` 사용 가능
- 프로덕션에서는 적절한 로깅 라이브러리 사용 권장
- 에러는 반드시 로깅

#### 코드 스타일
- 들여쓰기: 4 spaces
- 세미콜론: 필수
- 문자열: 작은따옴표 (`'`) 선호
- 화살표 함수보다 async/await 사용

### 11. API 설계 규칙

#### RESTful 원칙
```
GET    /api/resource       # 목록 조회
GET    /api/resource/:id   # 단일 조회
POST   /api/resource       # 생성
PUT    /api/resource/:id   # 수정
DELETE /api/resource/:id   # 삭제
```

#### 버전관리
- 현재: `/api/*`
- 향후 변경 시: `/api/v2/*` 형식 고려

#### 응답 일관성
- 항상 JSON 반환
- 일관된 응답 구조 유지
- 에러 응답도 동일한 형식 사용

### 12. 테스트 (향후 추가 예정)
- 단위 테스트: Jest
- 통합 테스트: Supertest
- 테스트 커버리지: 80% 이상 목표

### 13. Git 커밋 메시지
```
feat: 새로운 기능 추가
fix: 버그 수정
refactor: 코드 리팩토링
docs: 문서 수정
style: 코드 포맷팅
test: 테스트 추가/수정
chore: 빌드/설정 변경
```

### 14. 개발 워크플로우
1. 기능 명세 확인 ([USER_STORIES.md](../docs/USER_STORIES.md) 참조)
2. 타입 정의 작성 (`types/`)
3. 데이터베이스 스키마 설계/수정
4. Model 작성 및 테스트
5. Service 작성 (비즈니스 로직)
6. Controller 작성 (API 핸들러)
7. Route 설정
8. Swagger 문서 업데이트
9. **API 명세서 작성** ([API_SPECIFICATION.md](../docs/API_SPECIFICATION.md) 업데이트) - 필수
10. 통합 테스트
11. 코드 리뷰
12. **빌드 테스트** (필수)
13. 빌드 결과물 삭제

#### API 명세서 작성 규칙
기능 개발이 완료되면 반드시 `docs/API_SPECIFICATION.md`에 다음 정보를 추가해야 합니다:

1. **Endpoint**: HTTP 메서드 및 경로 (예: `POST /api/asset`)
2. **설명**: API의 목적과 기능
3. **인증 요구사항**: 🔒 (인증 필요) 또는 🔓 (인증 불필요)
4. **Headers**: 필요한 헤더 정보 (Authorization 등)
5. **URL Parameters**: 경로 파라미터 (예: `:id`)
6. **Query Parameters**: 쿼리 스트링 파라미터 (선택사항)
7. **Request Body**: 요청 본문 JSON 예시 (필요시)
8. **Response**: 성공 응답 JSON 예시 (상태 코드 포함)
9. **Error Responses**: 가능한 모든 에러 응답 (400, 401, 403, 404, 409, 500 등)
10. **필드 설명**: 중요한 필드의 의미, 타입, 제약사항
11. **검증 규칙**: 입력값 검증 규칙 상세 설명
12. **부가 효과**: 자산 잔액 변화 등의 부수 효과 명시

**작성 예시:**
```markdown
### X.X 기능명 🔒

**Endpoint:** `POST /api/resource`

**설명:** 리소스를 생성합니다.

**Headers:**
\`\`\`
Authorization: Bearer {token}
\`\`\`

**Request Body:**
\`\`\`json
{
  "field": "value"
}
\`\`\`

**Response (201 Created):**
\`\`\`json
{
  "success": true,
  "data": {}
}
\`\`\`

**Error Responses:**
- `400 Bad Request`: 필수 필드 누락
- `401 Unauthorized`: 인증 실패
```

**중요 사항:**
- API 개발 완료와 동시에 명세서를 작성해야 합니다 (나중으로 미루지 말 것)
- 프론트엔드 개발자가 백엔드 코드를 보지 않고도 API를 사용할 수 있을 정도로 상세하게 작성
- 모든 가능한 에러 케이스를 문서화
- 실제 동작하는 예시 데이터 사용

### 15. 빌드 테스트 규칙

#### 빌드 테스트 수행 시점
백엔드 개발이 완료되면 **반드시** 프로덕션 빌드 테스트를 수행해야 합니다.

#### 빌드 테스트 절차
```bash
# 1. TypeScript 빌드 실행
npm run build

# 2. 빌드 성공 확인
# - dist/ 디렉토리가 생성되었는지 확인
# - TypeScript 컴파일 에러가 없는지 확인
# - 모든 파일이 정상적으로 변환되었는지 확인

# 3. 빌드된 파일로 서버 실행 테스트 (선택사항)
npm run start

# 4. 빌드 결과물 삭제
rm -rf dist/
# Windows의 경우
# rmdir /s /q dist
```

#### 빌드 테스트 체크리스트
- [ ] `npm run build` 명령 실행 시 에러 없이 완료
- [ ] TypeScript 타입 에러 없음
- [ ] `dist/` 디렉토리 생성 확인
- [ ] 모든 `.ts` 파일이 `.js`로 변환됨
- [ ] 빌드된 서버가 정상적으로 실행됨 (선택사항)
- [ ] 테스트 완료 후 `dist/` 디렉토리 삭제

#### 빌드 실패 시 조치사항
1. TypeScript 컴파일 에러 확인 및 수정
2. 타입 정의 누락 확인
3. import/export 문제 확인
4. tsconfig.json 설정 확인

#### 주의사항
- **프로덕션 빌드 결과물(`dist/`)은 Git에 커밋하지 않음** (.gitignore에 포함)
- 빌드 테스트는 개발 완료 시점에 반드시 수행
- CI/CD 파이프라인 구축 시 자동 빌드 테스트 포함 권장