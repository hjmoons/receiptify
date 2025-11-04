# Receiptify - 개인 가계부 관리 애플리케이션

## 프로젝트 개요
Receiptify는 개인의 수입과 지출을 효과적으로 관리할 수 있는 웹 기반 가계부 애플리케이션입니다.

## 프로젝트 구조
```
receiptify/
├── backend/              # 백엔드 서버 (Express.js + TypeScript)
│   └── CLAUDE.md        # 백엔드 상세 문서
├── frontend/            # 프론트엔드 클라이언트 (React + TypeScript)
├── Install.md          # 설치 가이드
└── README.md           # 프로젝트 소개
```

## 기술 스택

### Backend
- **Framework**: Express.js 5.1.0
- **Language**: TypeScript 5.8.3
- **Database**: SQLite3 (better-sqlite3)
- **Authentication**: JWT
- **API Documentation**: Swagger UI
- **Security**: bcryptjs, CORS

### Frontend
- **Framework**: React 19.1.0
- **Language**: TypeScript 5.8.3
- **Build Tool**: Vite 7.0.4
- **Styling**: Tailwind CSS 3.4.17
- **Routing**: React Router DOM 7.7.0
- **HTTP Client**: Axios 1.10.0

## 주요 명령어

### Backend
```bash
cd backend
npm install              # 의존성 설치
npm run dev             # 개발 서버 실행 (포트: 5000)
npm run build           # TypeScript 빌드
npm run start           # 프로덕션 서버 실행
```

### Frontend
```bash
cd frontend
npm install              # 의존성 설치
npm run dev             # 개발 서버 실행 (포트: 3000)
npm run build           # 프로덕션 빌드
npm run lint            # ESLint 실행
npm run preview         # 빌드 결과 미리보기
```

## 주요 기능
1. **사용자 관리**
   - 회원가입 및 로그인
   - JWT 토큰 기반 인증

2. **자산 관리**
   - 카드/계좌 등록 및 관리
   - 실시간 잔액 조회

3. **가계부 관리**
   - 수입/지출/이체 내역 기록
   - 카테고리별 분류
   - 거래 내역 수정 및 삭제

4. **카테고리 관리**
   - 3단계 계층적 카테고리 구조
   - 수입/지출별 카테고리 분류
   - 사용자 맞춤 카테고리

5. **통계 및 분석**
   - 월별 수입/지출 통계
   - 카테고리별 지출 분석

## API 엔드포인트
백엔드 서버는 `http://localhost:5000`에서 실행되며, 
API 문서는 `http://localhost:5000/api-docs`에서 확인할 수 있습니다.

### 주요 API
- `/api/auth/*` - 인증 관련
- `/api/asset/*` - 자산 관리
- `/api/category/*` - 카테고리 관리
- `/api/receipt/*` - 가계부 내역 관리

## 데이터베이스 구조
- **users**: 사용자 정보
- **assets**: 자산 정보 (카드, 계좌)
- **categories**: 수입/지출 카테고리
- **receipts**: 거래 내역
- **statistics**: 통계 데이터

## 상세 문서
- [Backend 상세 문서](./backend/CLAUDE.md) - 백엔드 아키텍처, API, 데이터베이스 스키마 등
- [Frontend 상세 문서](./frontend/CLAUDE.md) - 프론트엔드 아키텍처, 컴포넌트, 개발 규칙 등
- [User Stories](./docs/USER_STORIES.md) - 전체 기능 명세 및 구현 상태
- [API 명세서](./docs/API_SPECIFICATION.md) - REST API 엔드포인트 상세 문서
- [Installation Guide](./Install.md) - 설치 및 실행 가이드

## 개발 시작하기
1. 저장소 클론
2. Backend 설정:
   ```bash
   cd backend
   npm install
   npm run dev
   ```
3. Frontend 설정:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
4. 브라우저에서 `http://localhost:3000` 접속

## 보안 고려사항
- 비밀번호는 bcrypt로 해싱
- JWT 토큰 기반 인증
- CORS 설정으로 허가된 도메인만 접근 가능
- SQL Injection 방지를 위한 Prepared Statements 사용
- 사용자별 데이터 접근 제어

## 성능 최적화
- SQLite WAL 모드 사용
- 주요 데이터베이스 쿼리에 인덱스 적용
- React 컴포넌트 최적화
- Vite를 통한 빠른 개발 환경