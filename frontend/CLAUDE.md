# Receiptify Frontend

## 프로젝트 개요
Receiptify의 프론트엔드는 React와 TypeScript를 기반으로 구축된 웹 애플리케이션입니다. Vite를 빌드 도구로 사용하며, Tailwind CSS로 스타일링되어 있습니다.

**중요**:
- 기능 개발 시 [USER_STORIES.md](../docs/USER_STORIES.md)를 반드시 참조하여 요구사항 및 구현 상태를 확인하세요.
- 백엔드 API 연동 시 [API_SPECIFICATION.md](../docs/API_SPECIFICATION.md)를 참조하세요.

## 기술 스택
- **프레임워크**: React 19.1.0
- **언어**: TypeScript 5.8.3
- **빌드 도구**: Vite 7.0.4
- **스타일링**: Tailwind CSS 3.4.17
- **라우팅**: React Router DOM 7.7.0
- **HTTP 클라이언트**: Axios 1.10.0
- **개발 도구**: ESLint, TypeScript ESLint

## 프로젝트 구조
```
frontend/
├── public/                  # 정적 파일
├── src/
│   ├── assets/             # 이미지, 폰트 등 정적 자산
│   ├── components/         # React 컴포넌트
│   │   ├── common/         # 공통 컴포넌트
│   │   │   ├── AssetModal.tsx      # 자산 추가/수정 모달
│   │   │   └── CategoryModal.tsx   # 카테고리 추가/수정 모달
│   │   └── settings/       # 설정 페이지 컴포넌트
│   │       ├── AssetSection.tsx    # 자산 관리 섹션
│   │       ├── CategorySections.tsx # 카테고리 관리 섹션
│   │       └── KebabMenu.tsx       # 케밥 메뉴 (수정/삭제)
│   ├── config/             # 설정 파일
│   ├── hooks/              # Custom React Hooks
│   │   ├── UseAssets.ts    # 자산 관리 훅
│   │   ├── UseCategories.ts # 카테고리 관리 훅
│   │   └── UseKebabMenu.ts # 케밥 메뉴 훅
│   ├── pages/              # 페이지 컴포넌트
│   │   ├── Home.tsx        # 메인 페이지 (탭 기반)
│   │   ├── Login.tsx       # 로그인 페이지
│   │   ├── Register.tsx    # 회원가입 페이지
│   │   ├── Settings.tsx    # 설정 페이지
│   │   └── tabs/           # 홈 페이지 탭들
│   │       ├── AssetsTab.tsx      # 자산 탭
│   │       ├── BudgetTab.tsx      # 가계부 탭
│   │       └── StatisticsTab.tsx  # 통계 탭
│   ├── types/              # TypeScript 타입 정의
│   │   ├── asset.ts        # 자산 타입
│   │   ├── auth.ts         # 인증 타입
│   │   └── category.ts     # 카테고리 타입
│   ├── utils/              # 유틸리티 함수
│   │   └── api.ts          # Axios 인스턴스 설정
│   ├── App.tsx             # 메인 앱 컴포넌트
│   ├── main.tsx            # 엔트리 포인트
│   └── index.css           # 전역 스타일
├── .env                    # 환경 변수
├── eslint.config.js        # ESLint 설정
├── index.html              # HTML 진입점
├── package.json            # 프로젝트 의존성
├── postcss.config.js       # PostCSS 설정
├── tailwind.config.js      # Tailwind CSS 설정
├── tsconfig.json           # TypeScript 설정
├── tsconfig.app.json       # 앱 TypeScript 설정
├── tsconfig.node.json      # Node TypeScript 설정
└── vite.config.ts          # Vite 설정
```

## 주요 명령어
```bash
# 개발 서버 실행 (http://localhost:3000)
npm run dev

# 프로덕션 빌드
npm run build

# ESLint 실행
npm run lint

# 프로덕션 빌드 미리보기
npm run preview
```

## 주요 페이지 및 기능

> 상세한 기능 명세는 [USER_STORIES.md](../docs/USER_STORIES.md)를 참조하세요.
> 백엔드 API 스펙은 [API_SPECIFICATION.md](../docs/API_SPECIFICATION.md)를 참조하세요.

### 1. 사용자 관리 ✅
**관련 페이지: Login.tsx, Register.tsx**

**구현 상태: 기본 기능 완료**

- ✅ 회원가입 (`Register.tsx`)
  - 이메일, 비밀번호, 이름 입력
  - 이메일 형식 검증
  - 회원가입 성공 시 자동 로그인
  - API: `POST /api/auth/register`

- ✅ 로그인 (`Login.tsx`)
  - 이메일/비밀번호 인증
  - JWT 토큰을 localStorage에 저장
  - 자동 로그인 유지
  - 로그인 후 메인 페이지로 리다이렉트
  - API: `POST /api/auth/login`

- ⏳ 로그아웃 (부분 구현)
  - 기능 존재하나 UI 개선 필요
  - localStorage 토큰 삭제
  - 로그인 페이지로 리다이렉트

- ❌ 비밀번호 변경 (미구현)
- ❌ 회원 탈퇴 (미구현)

### 2. 자산 관리 ✅
**관련 페이지: Settings.tsx, AssetsTab.tsx**
**관련 컴포넌트: AssetModal.tsx, AssetSection.tsx**
**관련 Hook: UseAssets.ts**

**구현 상태: 완료**

- ✅ 자산 추가
  - 자산 이름, 유형(계좌/카드), 초기 잔액 입력
  - 모달을 통한 추가 UI
  - 중복 이름 체크
  - API: `POST /api/asset`

- ✅ 자산 목록 조회
  - 카드 형태로 자산 목록 표시
  - 자산별 잔액 표시
  - 총 자산 금액 표시 (AssetsTab)
  - API: `GET /api/asset`

- ✅ 자산 수정
  - 모달을 통한 수정 UI
  - 자산 이름, 유형, 잔액 수정 가능
  - KebabMenu를 통한 수정 액션
  - API: `PUT /api/asset/:id`

- ✅ 자산 삭제
  - 삭제 전 확인 메시지 표시
  - KebabMenu를 통한 삭제 액션
  - API: `DELETE /api/asset/:id`

- ✅ 총 자산 조회
  - 클라이언트 측에서 계산 (AssetsTab)
  - 큰 숫자로 눈에 띄게 표시
  - 실시간 업데이트

### 3. 카테고리 관리 ✅
**관련 페이지: Settings.tsx**
**관련 컴포넌트: CategoryModal.tsx, CategorySections.tsx**
**관련 Hook: UseCategories.ts**

**구현 상태: 완료**

- ✅ 카테고리 추가
  - 카테고리 이름, 유형(수입/지출) 선택
  - 부모 카테고리 선택 (3단계 계층)
  - 모달을 통한 추가 UI
  - API: `POST /api/category`

- ✅ 카테고리 목록 조회
  - 수입/지출 카테고리 분리 표시
  - 계층 구조 트리 형태로 표시
  - 1단계 > 2단계 > 3단계 구조
  - API: `GET /api/category`

- ✅ 카테고리 수정
  - 모달을 통한 수정 UI
  - 카테고리 이름, 부모 카테고리 변경 가능
  - KebabMenu를 통한 수정 액션
  - API: `PUT /api/category/:id`

- ✅ 카테고리 삭제
  - 삭제 전 확인 메시지 표시
  - KebabMenu를 통한 삭제 액션
  - API: `DELETE /api/category/:id`

- ❌ 기본 카테고리 자동 생성 (미구현)

### 4. 가계부 내역 관리 ⏳
**관련 페이지: BudgetTab.tsx**

**구현 상태: 백엔드 완료, 프론트엔드 부분 구현**

- ⏳ 지출 내역 추가
  - 금액, 자산, 카테고리, 내용, 장소 입력
  - UI 부분 구현
  - API: `POST /api/receipt` (type: 0)

- ⏳ 수입 내역 추가
  - 금액, 자산, 카테고리, 내용 입력
  - UI 부분 구현
  - API: `POST /api/receipt` (type: 1)

- ⏳ 이체 내역 추가
  - 출금 자산, 입금 자산, 금액 입력
  - UI 부분 구현
  - API: `POST /api/receipt` (type: 2)

- ⏳ 거래 내역 조회
  - 기본 목록 표시
  - 카테고리, 금액, 자산, 날짜 표시
  - API: `GET /api/receipt`
  - **TODO**: 날짜별 그룹화, 거래 유형별 아이콘/색상 구분

- ❌ 거래 내역 상세 조회 (미구현)
- ❌ 거래 내역 수정 (미구현, 백엔드 API 존재)
- ❌ 거래 내역 삭제 (미구현, 백엔드 API 존재)
- ❌ 반복 거래 등록 (미구현)

### 5. 통계 및 분석 ⏳
**관련 페이지: StatisticsTab.tsx**

**구현 상태: 기본 구조만 구현**

- ⏳ 월별 지출 통계
  - 기본 구조 존재 (StatisticsTab)
  - **TODO**: 그래프 컴포넌트 추가
  - **TODO**: 백엔드 API 연동

- ⏳ 카테고리별 지출 분석
  - 기본 구조 존재 (StatisticsTab)
  - **TODO**: 원형 차트 또는 도넛 차트
  - **TODO**: 백엔드 API 연동

- ❌ 수입 vs 지출 비교 (미구현)
- ❌ 자산별 거래 통계 (미구현)
- ❌ 일별 지출 캘린더 (미구현)

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
- ❌ 예산 사용 현황 표시
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
- ❌ 데이터 내보내기
- ❌ 데이터 가져오기

### 10. 영수증 OCR 스캔 (주요 기능) ❌
**구현 상태: 미구현**

> **핵심 차별화 기능**: 영수증 사진 촬영/업로드 → 자동 품목 추출 → 카테고리 분류 → 거래 등록

- ❌ 영수증 사진 업로드
  - 카메라 촬영 또는 갤러리 선택
  - 이미지 미리보기 및 편집
  - 여러 장 동시 업로드

- ❌ OCR 결과 확인 및 수정
  - 추출된 영수증 정보 미리보기
  - 원본 이미지와 함께 표시
  - 각 필드 수정 가능
  - 품목별 카테고리 수정

- ❌ 품목별 거래 등록
  - 개별 등록 vs 통합 등록 선택
  - 일괄 등록 처리
  - 등록 완료 알림

- ❌ OCR 설정
  - 자동 카테고리 분류 on/off
  - 기본 자산 설정
  - 등록 방식 선택

**OCR UI 구현 시 고려사항:**
- 모바일 카메라 접근 (navigator.mediaDevices)
- 이미지 업로드 컴포넌트
- 품목 리스트 편집 UI
- 카테고리 매칭 확인 UI
- 로딩 상태 표시 (OCR 처리 중)

## 주요 컴포넌트

### Common 컴포넌트
- **AssetModal**: 자산 추가/수정을 위한 모달
- **CategoryModal**: 카테고리 추가/수정을 위한 모달

### Settings 컴포넌트
- **AssetSection**: 자산 목록 표시 및 관리
- **CategorySections**: 카테고리 트리 구조 표시 및 관리
- **KebabMenu**: 항목별 수정/삭제 메뉴

## Custom Hooks

### UseAssets
자산 관련 상태 및 기능 관리:
- 자산 목록 조회
- 자산 추가/수정/삭제
- 총 자산 계산

### UseCategories
카테고리 관련 상태 및 기능 관리:
- 카테고리 목록 조회
- 카테고리 추가/수정/삭제
- 계층 구조 관리

### UseKebabMenu
케밥 메뉴 상태 관리:
- 메뉴 열기/닫기
- 외부 클릭 감지

## API 통신

### Axios 설정 (api.ts)
```typescript
- baseURL: '/api' (Vite proxy를 통해 localhost:5000으로 전달)
- Request Interceptor: JWT 토큰 자동 추가
- Response Interceptor: 401 에러 시 자동 로그아웃
```

### API 엔드포인트
모든 API는 `/api` 경로를 통해 백엔드와 통신:
- `POST /api/auth/register` - 회원가입
- `POST /api/auth/login` - 로그인
- `GET /api/asset` - 자산 목록 조회
- `POST /api/asset` - 자산 추가
- `PUT /api/asset/:id` - 자산 수정
- `DELETE /api/asset/:id` - 자산 삭제
- `GET /api/category` - 카테고리 목록 조회
- `POST /api/category` - 카테고리 추가
- `PUT /api/category/:id` - 카테고리 수정
- `DELETE /api/category/:id` - 카테고리 삭제
- `GET /api/receipt` - 거래 내역 조회
- `POST /api/receipt` - 거래 내역 추가
- `PUT /api/receipt/:id` - 거래 내역 수정
- `DELETE /api/receipt/:id` - 거래 내역 삭제

## 타입 정의

### Asset (asset.ts)
```typescript
- Asset: 자산 엔티티
- AssetForm: 자산 추가/수정 폼
- AssetStyle: 자산 타입별 스타일 정의
- TotalAssetsResponse: 총 자산 API 응답
```

### Auth (auth.ts)
```typescript
- User: 사용자 정보
- LoginFormData: 로그인 폼 데이터
- AuthResponse: 인증 API 응답
```

### Category (category.ts)
```typescript
- Category: 카테고리 엔티티
- CategoryTree: 계층 구조 카테고리
```

## 라우팅
```typescript
- /login - 로그인 페이지
- /register - 회원가입 페이지
- / - 메인 페이지 (홈)
- /settings - 설정 페이지
```

## 스타일링
- **Tailwind CSS**: 유틸리티 퍼스트 CSS 프레임워크
- **반응형 디자인**: 모바일/태블릿/데스크톱 지원
- **다크 모드**: (향후 지원 예정)

## 환경 변수
`.env` 파일에서 관리:
```bash
VITE_API_URL=http://localhost:5000/api
```

## 개발 환경 설정
1. Node.js 18+ 설치
2. `npm install`로 의존성 설치
3. `.env` 파일 생성 및 설정
4. 백엔드 서버 실행 (localhost:5000)
5. `npm run dev`로 프론트엔드 개발 서버 시작
6. 브라우저에서 `http://localhost:3000` 접속

## 보안 기능
- JWT 토큰 기반 인증
- localStorage에 토큰 저장
- 401 에러 시 자동 로그아웃
- axios interceptor를 통한 자동 토큰 첨부
- XSS 방지 (React 기본 보안)

## 성능 최적화
- Vite를 통한 빠른 HMR (Hot Module Replacement)
- React 19의 최신 성능 기능 활용
- 컴포넌트 기반 코드 스플리팅
- Custom Hooks를 통한 로직 재사용

## 빌드 및 배포
```bash
# 프로덕션 빌드
npm run build

# dist 폴더에 최적화된 정적 파일 생성
# - JavaScript 번들 최적화
# - CSS 압축
# - 자산 해싱 (캐싱 최적화)
```

## 개발 가이드라인
1. **컴포넌트 구조**
   - 페이지 컴포넌트는 `pages/` 디렉토리에 배치
   - 재사용 가능한 컴포넌트는 `components/` 디렉토리에 배치
   - 공통 컴포넌트는 `components/common/`에 배치

2. **상태 관리**
   - Custom Hooks를 사용하여 로직과 UI 분리
   - 전역 상태 관리가 필요한 경우 Context API 사용 검토

3. **타입 안정성**
   - 모든 컴포넌트와 함수에 TypeScript 타입 명시
   - API 응답에 대한 타입 정의 필수
   - `types/` 디렉토리에 타입 정의 파일 관리

4. **API 호출**
   - `utils/api.ts`의 axios 인스턴스 사용
   - Custom Hooks 내에서 API 호출 로직 관리
   - 에러 처리 및 로딩 상태 관리

5. **스타일링**
   - Tailwind CSS 유틸리티 클래스 사용
   - 일관된 디자인 시스템 유지
   - 컴포넌트별 스타일 분리

## 향후 개선 사항
- [ ] 전역 상태 관리 (Zustand/Recoil)
- [ ] 다크 모드 지원
- [ ] PWA (Progressive Web App) 지원
- [ ] 국제화 (i18n)
- [ ] 단위 테스트 (Vitest)
- [ ] E2E 테스트 (Playwright)
- [ ] 접근성 (a11y) 개선

---

## 개발 규칙 (Coding Conventions)

### 1. 프로젝트 아키텍처
프론트엔드는 **컴포넌트 기반 아키텍처**를 따릅니다.

```
Pages → Components → Hooks → API (utils/api.ts) → Backend
```

#### 각 계층의 역할
- **Pages**: 라우트별 페이지 컴포넌트, 전체 레이아웃 구성
- **Components**: 재사용 가능한 UI 컴포넌트
- **Hooks**: 비즈니스 로직, 상태 관리, API 호출
- **Utils**: API 클라이언트, 헬퍼 함수, 유틸리티

### 2. 파일 및 네이밍 규칙

#### 파일명
- **컴포넌트**: PascalCase (예: `AssetModal.tsx`, `CategorySection.tsx`)
- **Hooks**: camelCase with Use prefix (예: `UseAssets.ts`, `UseCategories.ts`)
- **유틸리티**: camelCase (예: `api.ts`, `formatDate.ts`)
- **타입 정의**: camelCase (예: `asset.ts`, `category.ts`)

#### 컴포넌트명
- **PascalCase** 사용
- 명확하고 설명적인 이름
  ```typescript
  AssetModal
  CategorySection
  KebabMenu
  ```

#### 함수/변수명
- **camelCase** 사용
- Custom Hooks는 `use` 접두사 사용
  ```typescript
  const userId = getUserId();
  const { assets, loading } = useAssets();
  ```

#### 상수명
- **UPPER_SNAKE_CASE** 사용
  ```typescript
  const API_BASE_URL = 'http://localhost:5000';
  const MAX_FILE_SIZE = 5 * 1024 * 1024;
  ```

### 3. TypeScript 규칙

#### 타입 정의
- 모든 컴포넌트 props에 타입 정의
- API 응답 타입은 `types/` 디렉토리에 정의
- 인터페이스 명명 규칙:
  ```typescript
  interface Asset {}           // 엔티티
  interface AssetForm {}       // 폼 데이터
  interface AssetStyle {}      // 스타일 관련
  interface ApiResponse<T> {}  // API 응답
  ```

#### any 타입 사용 금지
- `any` 대신 구체적인 타입 또는 `unknown` 사용
- 불가피한 경우 주석으로 이유 명시

#### Props 타입 정의
```typescript
interface AssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AssetForm) => Promise<void>;
  initialData?: Asset;  // Optional prop
}
```

### 4. 컴포넌트 작성 규칙

#### 기본 구조
```typescript
/**
 * 파일명: AssetModal.tsx
 * 설명: 자산 추가/수정 모달 컴포넌트
 * 작성일: 2024-01-15
 * 작성자: 개발자명
 */

import { useState, useEffect } from 'react';
import { AssetForm } from '../types/asset';

interface AssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AssetForm) => Promise<void>;
}

export default function AssetModal({ isOpen, onClose, onSubmit }: AssetModalProps) {
  // 1. State 선언
  const [formData, setFormData] = useState<AssetForm>({
    name: '',
    type: 'account',
    balance: 0
  });
  const [loading, setLoading] = useState(false);

  // 2. Hooks 호출
  useEffect(() => {
    // Effect 로직
  }, []);

  // 3. 이벤트 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Failed to submit:', error);
    } finally {
      setLoading(false);
    }
  };

  // 4. 조건부 렌더링
  if (!isOpen) return null;

  // 5. JSX 반환
  return (
    <div className="modal">
      {/* 컴포넌트 UI */}
    </div>
  );
}
```

#### 컴포넌트 분류
1. **Page 컴포넌트** (`pages/`)
   - 라우트와 1:1 매핑
   - 전체 페이지 레이아웃 구성
   - 여러 컴포넌트 조합

2. **Common 컴포넌트** (`components/common/`)
   - 재사용 가능한 공통 컴포넌트
   - 프로젝트 전반에서 사용
   - 예: Modal, Button, Input

3. **Feature 컴포넌트** (`components/settings/`, etc.)
   - 특정 기능에 종속된 컴포넌트
   - 해당 기능 내에서만 사용

### 5. Custom Hooks 작성 규칙

#### 기본 구조
```typescript
/**
 * 파일명: UseAssets.ts
 * 설명: 자산 관리 관련 상태 및 API 호출 로직
 * 작성일: 2024-01-15
 * 작성자: 개발자명
 *
 * 수정 이력:
 * - 2024-01-20: 총 자산 조회 기능 추가 (개발자명)
 */

import { useState, useEffect } from 'react';
import api from '../utils/api';
import { Asset, AssetForm } from '../types/asset';

export const useAssets = () => {
  // 1. State 정의
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 2. 데이터 조회
  const fetchAssets = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/asset');
      setAssets(response.data.data);
    } catch (err) {
      setError('자산 목록을 불러오는데 실패했습니다.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 3. CRUD 작업
  const createAsset = async (data: AssetForm) => {
    const response = await api.post('/asset', data);
    await fetchAssets(); // 목록 새로고침
    return response.data.data;
  };

  const updateAsset = async (id: number, data: Partial<AssetForm>) => {
    await api.put(`/asset/${id}`, data);
    await fetchAssets();
  };

  const deleteAsset = async (id: number) => {
    await api.delete(`/asset/${id}`);
    await fetchAssets();
  };

  // 4. 초기 로드
  useEffect(() => {
    fetchAssets();
  }, []);

  // 5. 반환값
  return {
    assets,
    loading,
    error,
    fetchAssets,
    createAsset,
    updateAsset,
    deleteAsset
  };
};
```

#### Hook 작성 가이드라인
- 하나의 Hook은 하나의 도메인(자산, 카테고리 등)만 담당
- 로딩, 에러 상태 관리 필수
- API 호출 후 에러 처리 필수
- 필요한 경우 낙관적 업데이트 구현

### 6. 상태 관리 규칙

#### Local State
- 컴포넌트 내부에서만 사용되는 상태는 `useState` 사용
  ```typescript
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>(initialData);
  ```

#### Shared State (Custom Hooks)
- 여러 컴포넌트에서 공유되는 상태는 Custom Hook으로 관리
- API 호출 로직도 Custom Hook에 포함

#### Global State (향후)
- 전역 상태가 필요한 경우 Context API 또는 Zustand 사용 검토
- 현재는 Custom Hooks로 충분

### 7. API 호출 규칙

#### axios 인스턴스 사용
```typescript
import api from '../utils/api';

// GET 요청
const response = await api.get('/asset');
const assets = response.data.data;

// POST 요청
const response = await api.post('/asset', {
  name: '신한카드',
  type: 'card',
  balance: 100000
});

// PUT 요청
await api.put(`/asset/${id}`, updateData);

// DELETE 요청
await api.delete(`/asset/${id}`);
```

#### 에러 처리
```typescript
try {
  const response = await api.get('/asset');
  setData(response.data.data);
} catch (error) {
  if (axios.isAxiosError(error)) {
    // Axios 에러 처리
    const message = error.response?.data?.message || '요청 실패';
    setError(message);
  } else {
    // 기타 에러
    setError('알 수 없는 오류가 발생했습니다.');
  }
  console.error('API Error:', error);
}
```

### 8. 스타일링 규칙

#### Tailwind CSS 사용
```typescript
// 기본 스타일
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow">

// 조건부 스타일
<button
  className={`px-4 py-2 rounded ${
    isActive ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
  }`}
>

// 반응형 디자인
<div className="w-full md:w-1/2 lg:w-1/3">
```

#### 스타일 가이드라인
- 인라인 스타일 지양, Tailwind 유틸리티 클래스 사용
- 공통 스타일 패턴은 컴포넌트로 추출
- 색상, 간격은 Tailwind 기본값 사용
- 커스텀 스타일이 필요한 경우 `tailwind.config.js`에 정의

### 9. 주석 규칙

#### 파일 헤더 주석
```typescript
/**
 * 파일명: UseAssets.ts
 * 설명: 자산 관리 Custom Hook
 * 작성일: 2024-01-15
 * 작성자: 개발자명
 *
 * 수정 이력:
 * - 2024-01-20: 총 자산 조회 기능 추가 (개발자명)
 * - 2024-01-25: 에러 처리 개선 (개발자명)
 */
```

#### 컴포넌트/함수 JSDoc
```typescript
/**
 * 자산 추가/수정 모달 컴포넌트
 *
 * @param props - 컴포넌트 props
 * @param props.isOpen - 모달 표시 여부
 * @param props.onClose - 모달 닫기 핸들러
 * @param props.onSubmit - 폼 제출 핸들러
 * @param props.initialData - 수정 시 초기 데이터 (optional)
 *
 * @example
 * <AssetModal
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   onSubmit={handleSubmit}
 * />
 */
```

#### TODO/FIXME 태그
```typescript
// TODO: 폼 검증 로직 추가 필요 (2024-01-15, 개발자명)
// FIXME: 모달 닫힐 때 폼 초기화 안됨 (2024-01-20, 개발자명)
// NOTE: 이 컴포넌트는 React 19 기능 사용중
// OPTIMIZE: 불필요한 리렌더링 최적화 가능
```

#### 복잡한 로직 주석
```typescript
// 1단계: 기존 자산 목록에서 수정된 항목 찾기
const assetIndex = assets.findIndex(a => a.id === updatedAsset.id);

// 2단계: 배열 불변성 유지하며 업데이트
const newAssets = [
  ...assets.slice(0, assetIndex),
  updatedAsset,
  ...assets.slice(assetIndex + 1)
];

// 3단계: 상태 업데이트
setAssets(newAssets);
```

### 10. 개발 주의사항

#### 기존 코드 분석 및 일관성 유지
- **새로운 기능을 개발하기 전에 반드시 기존 코드를 분석**하여 패턴과 구조를 파악하세요
- 기존 코드의 네이밍 컨벤션, 파일 구조, 컴포넌트 설계 패턴을 따라야 합니다
- 비슷한 기능이 이미 구현되어 있다면, 그 구현 방식을 참고하여 일관성을 유지하세요
- 예: 자산 관리 페이지를 참고하여 새로운 관리 페이지를 만들 때, Hook 패턴, 모달 구조, 폼 처리 방식 등을 동일하게 유지

#### Mock 데이터 및 가짜 구현 금지
- **절대로 Mock 데이터나 하드코딩된 가짜 데이터를 사용하지 마세요**
- 모든 데이터는 백엔드 API에서 가져와야 합니다
- 임시 구현이나 TODO로 남기지 말고, 완전한 기능을 구현하세요
- 개발 중 테스트가 필요하다면 백엔드 개발 서버를 실행하여 실제 API를 사용하세요
- 예시 - ❌ 잘못된 구현:
  ```typescript
  const fetchAssets = async () => {
    // TODO: API 연동
    setAssets([
      { id: 1, name: "테스트 자산", type: "card", balance: 100000 }
    ]);
  };
  ```
- 예시 - ✅ 올바른 구현:
  ```typescript
  const fetchAssets = async () => {
    try {
      const response = await api.get('/asset');
      setAssets(response.data.data);
    } catch (error) {
      handleError(error);
    }
  };
  ```

#### 테스트 가능한 구조로 설계
- 비즈니스 로직은 Custom Hook으로 분리하여 재사용성과 테스트 가능성을 높이세요
- UI 컴포넌트는 가능한 한 순수하게 유지하고, 로직은 Hook에 위임하세요
- 복잡한 계산 로직은 별도의 유틸리티 함수로 분리하세요
- Props는 명확하게 타입을 정의하고, 의존성을 최소화하세요
- 컴포넌트는 단일 책임 원칙을 따라 작게 분리하세요
- 예: API 호출, 상태 관리, 에러 처리를 Custom Hook에서 처리하고, 컴포넌트는 렌더링만 담당

### 11. 이벤트 핸들러 규칙

#### 네이밍
```typescript
// handle + 동작 + 대상
const handleSubmitForm = () => {};
const handleClickButton = () => {};
const handleChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {};
```

#### 이벤트 타입
```typescript
// Form 이벤트
const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  // 로직
};

// Input 이벤트
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setFormData({ ...formData, [e.target.name]: e.target.value });
};

// Click 이벤트
const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
  // 로직
};
```

### 11. 폼 처리 규칙

#### 제어 컴포넌트 사용
```typescript
const [formData, setFormData] = useState<AssetForm>({
  name: '',
  type: 'account',
  balance: 0
});

const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const { name, value } = e.target;
  setFormData(prev => ({
    ...prev,
    [name]: name === 'balance' ? Number(value) : value
  }));
};

return (
  <input
    name="name"
    value={formData.name}
    onChange={handleChange}
  />
);
```

#### 폼 검증
```typescript
const validateForm = (data: AssetForm): string[] => {
  const errors: string[] = [];

  if (!data.name.trim()) {
    errors.push('자산 이름을 입력해주세요.');
  }

  if (data.balance < 0) {
    errors.push('잔액은 0 이상이어야 합니다.');
  }

  return errors;
};

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  const errors = validateForm(formData);
  if (errors.length > 0) {
    setErrors(errors);
    return;
  }

  // 제출 로직
};
```

### 12. 성능 최적화

#### React.memo 사용
```typescript
// 불필요한 리렌더링 방지
export const AssetItem = React.memo(({ asset, onDelete }: AssetItemProps) => {
  return (
    <div>{asset.name}</div>
  );
});
```

#### useCallback 사용
```typescript
// 함수 메모이제이션
const handleDelete = useCallback((id: number) => {
  deleteAsset(id);
}, [deleteAsset]);
```

#### useMemo 사용
```typescript
// 계산 결과 메모이제이션
const totalBalance = useMemo(() => {
  return assets.reduce((sum, asset) => sum + asset.balance, 0);
}, [assets]);
```

### 13. 에러 처리 및 로딩 상태

#### 로딩 상태 표시
```typescript
if (loading) {
  return <div className="text-center">로딩 중...</div>;
}

if (error) {
  return <div className="text-red-500">에러: {error}</div>;
}

return <div>{/* 정상 UI */}</div>;
```

#### 에러 바운더리 (향후)
```typescript
// 에러 바운더리로 컴포넌트 감싸기
<ErrorBoundary fallback={<ErrorFallback />}>
  <App />
</ErrorBoundary>
```

### 14. 코드 품질

#### ESLint 규칙 준수
- `npm run lint`로 정기적 검사
- 커밋 전 린트 에러 해결 필수

#### 코드 스타일
- 들여쓰기: 2 spaces
- 세미콜론: 필수
- 문자열: 작은따옴표 (`'`) 선호
- JSX에서는 중괄호 내 큰따옴표 (`"`)

#### Import 순서
```typescript
// 1. React 관련
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// 2. 서드파티 라이브러리
import axios from 'axios';

// 3. 내부 모듈 (절대경로)
import { useAssets } from '../hooks/UseAssets';
import { Asset } from '../types/asset';
import api from '../utils/api';

// 4. 컴포넌트
import AssetModal from '../components/common/AssetModal';

// 5. 스타일 (필요시)
import './styles.css';
```

### 15. Git 커밋 메시지
```
feat: 새로운 기능 추가
fix: 버그 수정
refactor: 코드 리팩토링
style: 스타일 변경 (UI/CSS)
docs: 문서 수정
test: 테스트 추가/수정
chore: 빌드/설정 변경
perf: 성능 개선
```

### 16. 개발 워크플로우
1. 기능 명세 확인
2. 타입 정의 작성 (`types/`)
3. API 연동 확인 (백엔드 API 존재 여부)
4. Custom Hook 작성 (필요시)
5. 컴포넌트 작성 (UI)
6. 스타일링 (Tailwind CSS)
7. 테스트 (수동 또는 자동)
8. 린트 검사 (`npm run lint`)
9. 코드 리뷰
10. **빌드 테스트** (필수)
11. 빌드 결과물 삭제

### 17. 빌드 테스트 규칙

#### 빌드 테스트 수행 시점
프론트엔드 개발이 완료되면 **반드시** 프로덕션 빌드 테스트를 수행해야 합니다.

#### 빌드 테스트 절차
```bash
# 1. 린트 검사 (빌드 전 필수)
npm run lint

# 2. 프로덕션 빌드 실행
npm run build

# 3. 빌드 성공 확인
# - dist/ 디렉토리가 생성되었는지 확인
# - TypeScript 컴파일 에러가 없는지 확인
# - Vite 빌드 경고/에러가 없는지 확인
# - 번들 크기가 적절한지 확인

# 4. 빌드 결과물 미리보기 (선택사항)
npm run preview
# http://localhost:4173 에서 빌드된 앱 테스트

# 5. 빌드 결과물 삭제
rm -rf dist/
# Windows의 경우
# rmdir /s /q dist
```

#### 빌드 테스트 체크리스트
- [ ] `npm run lint` 실행 시 에러 없이 완료
- [ ] `npm run build` 명령 실행 시 에러 없이 완료
- [ ] TypeScript 타입 에러 없음
- [ ] Vite 빌드 경고 없음 (또는 무시 가능한 경고만 존재)
- [ ] `dist/` 디렉토리 생성 확인
- [ ] `dist/index.html` 및 정적 자산 파일들 생성 확인
- [ ] 번들 크기 확인 (권장: main bundle < 500KB)
- [ ] 빌드된 앱이 정상적으로 실행됨 (선택사항)
- [ ] 테스트 완료 후 `dist/` 디렉토리 삭제

#### 빌드 최적화 체크
```bash
# 빌드 후 번들 크기 확인
npm run build

# 출력 예시:
# dist/assets/index-a1b2c3d4.js   150.23 kB │ gzip: 48.12 kB
# dist/assets/vendor-e5f6g7h8.js  280.45 kB │ gzip: 92.34 kB
```

**번들 크기 권장 사항:**
- Main JS bundle: < 500KB (gzipped < 150KB)
- Vendor JS bundle: < 1MB (gzipped < 300KB)
- CSS bundle: < 100KB (gzipped < 30KB)

#### 빌드 실패 시 조치사항
1. **TypeScript 에러**: 타입 정의 확인 및 수정
2. **ESLint 에러**: 린트 규칙 위반 수정
3. **Missing dependencies**: package.json 확인
4. **Import 에러**: 경로 및 확장자 확인
5. **Vite 설정 에러**: vite.config.ts 확인

#### 주의사항
- **프로덕션 빌드 결과물(`dist/`)은 Git에 커밋하지 않음** (.gitignore에 포함)
- 빌드 테스트는 개발 완료 시점에 반드시 수행
- 린트 에러가 있으면 빌드하지 말고 먼저 수정
- CI/CD 파이프라인 구축 시 자동 빌드 테스트 포함 권장
- 번들 크기가 너무 크면 코드 스플리팅 또는 lazy loading 고려
