# Receiptify API 명세서

> **중요**: 백엔드 기능 개발이 완료되면 반드시 해당 API의 명세를 이 문서에 추가해야 합니다.

## 목차
- [1. 인증 (Authentication)](#1-인증-authentication)
- [2. 자산 관리 (Asset Management)](#2-자산-관리-asset-management)
- [3. 카테고리 관리 (Category Management)](#3-카테고리-관리-category-management)
- [4. 가계부 내역 관리 (Receipt Management)](#4-가계부-내역-관리-receipt-management)
- [5. 통계 및 분석 (Statistics)](#5-통계-및-분석-statistics)
- [6. 검색 및 필터링 (Search & Filter)](#6-검색-및-필터링-search--filter)
- [7. 예산 관리 (Budget Management)](#7-예산-관리-budget-management)
- [8. 영수증 OCR (Receipt OCR)](#8-영수증-ocr-receipt-ocr)

---

## 범례
- 🔒 인증 필요
- 🔓 인증 불필요

---

## 1. 인증 (Authentication)

### 1.1 회원가입 🔓

**Endpoint:** `POST /api/auth/register`

**설명:** 새로운 사용자를 등록합니다.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "홍길동"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "userId": 1,
    "email": "user@example.com",
    "name": "홍길동",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses:**
- `400 Bad Request`: 필수 필드 누락 또는 형식 오류
  ```json
  {
    "success": false,
    "message": "이메일 형식이 올바르지 않습니다."
  }
  ```
- `409 Conflict`: 이메일 중복
  ```json
  {
    "success": false,
    "message": "이미 등록된 이메일입니다."
  }
  ```

**검증 규칙:**
- `email`: 유효한 이메일 형식
- `password`: 최소 8자, 영문 및 숫자 포함
- `name`: 필수

---

### 1.2 로그인 🔓

**Endpoint:** `POST /api/auth/login`

**설명:** 사용자 로그인 및 JWT 토큰 발급

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "userId": 1,
    "email": "user@example.com",
    "name": "홍길동",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses:**
- `400 Bad Request`: 필수 필드 누락
- `401 Unauthorized`: 이메일 또는 비밀번호 불일치
  ```json
  {
    "success": false,
    "message": "이메일 또는 비밀번호가 일치하지 않습니다."
  }
  ```

---

## 2. 자산 관리 (Asset Management)

### 2.1 자산 생성 🔒

**Endpoint:** `POST /api/asset`

**설명:** 새로운 자산(카드/계좌)을 생성합니다.

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "name": "신한카드",
  "type": "card",
  "balance": 100000,
  "user_id": 1
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "신한카드",
    "type": "card",
    "balance": 100000,
    "user_id": 1,
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

**Error Responses:**
- `400 Bad Request`: 필수 필드 누락 또는 타입 오류
- `401 Unauthorized`: 인증 실패
- `409 Conflict`: 동일한 이름의 자산 존재

**검증 규칙:**
- `name`: 필수, 중복 불가
- `type`: 'card' 또는 'account'
- `balance`: 숫자형
- `user_id`: 필수

---

### 2.2 자산 목록 조회 🔒

**Endpoint:** `GET /api/asset`

**설명:** 로그인한 사용자의 모든 자산을 조회합니다.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "신한카드",
      "type": "card",
      "balance": 100000,
      "user_id": 1,
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    },
    {
      "id": 2,
      "name": "국민은행 입출금",
      "type": "account",
      "balance": 500000,
      "user_id": 1,
      "created_at": "2024-01-15T10:35:00Z",
      "updated_at": "2024-01-15T10:35:00Z"
    }
  ]
}
```

**Error Responses:**
- `401 Unauthorized`: 인증 실패

---

### 2.3 자산 상세 조회 🔒

**Endpoint:** `GET /api/asset/:id`

**설명:** 특정 자산의 상세 정보를 조회합니다.

**Headers:**
```
Authorization: Bearer {token}
```

**URL Parameters:**
- `id`: 자산 ID (숫자)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "신한카드",
    "type": "card",
    "balance": 100000,
    "user_id": 1,
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

**Error Responses:**
- `400 Bad Request`: 잘못된 ID 형식
- `401 Unauthorized`: 인증 실패
- `404 Not Found`: 자산을 찾을 수 없음

---

### 2.4 자산 수정 🔒

**Endpoint:** `PUT /api/asset/:id`

**설명:** 기존 자산 정보를 수정합니다.

**Headers:**
```
Authorization: Bearer {token}
```

**URL Parameters:**
- `id`: 자산 ID (숫자)

**Request Body:**
```json
{
  "name": "신한카드 DEEP Dream",
  "type": "card",
  "balance": 150000
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "신한카드 DEEP Dream",
    "type": "card",
    "balance": 150000,
    "user_id": 1,
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T15:20:00Z"
  }
}
```

**Error Responses:**
- `400 Bad Request`: 잘못된 ID 또는 데이터 형식
- `401 Unauthorized`: 인증 실패
- `403 Forbidden`: 소유권 없음
- `404 Not Found`: 자산을 찾을 수 없음

---

### 2.5 자산 삭제 🔒

**Endpoint:** `DELETE /api/asset/:id`

**설명:** 자산을 삭제합니다.

**Headers:**
```
Authorization: Bearer {token}
```

**URL Parameters:**
- `id`: 자산 ID (숫자)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "신한카드",
    "type": "card",
    "balance": 100000,
    "user_id": 1
  },
  "message": "자산이 성공적으로 삭제되었습니다."
}
```

**Error Responses:**
- `400 Bad Request`: 잘못된 ID 형식
- `401 Unauthorized`: 인증 실패
- `403 Forbidden`: 소유권 없음
- `404 Not Found`: 자산을 찾을 수 없음

---

### 2.6 총 자산 조회 🔒

**Endpoint:** `GET /api/asset/total`

**설명:** 사용자의 모든 자산 잔액 합계를 조회합니다.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "totalValue": 600000
  }
}
```

**Error Responses:**
- `401 Unauthorized`: 인증 실패

---

## 3. 카테고리 관리 (Category Management)

### 3.1 카테고리 생성 🔒

**Endpoint:** `POST /api/category`

**설명:** 새로운 카테고리를 생성합니다.

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "name": "식비",
  "type": 0,
  "level": 1,
  "parent_id": null,
  "user_id": 1
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "식비",
    "type": 0,
    "level": 1,
    "parent_id": null,
    "user_id": 1
  }
}
```

**필드 설명:**
- `type`: 0 (지출) 또는 1 (수입)
- `level`: 1, 2, 3 (계층 레벨)
- `parent_id`: 부모 카테고리 ID (1단계는 null)

**Error Responses:**
- `400 Bad Request`: 필수 필드 누락 또는 형식 오류
- `401 Unauthorized`: 인증 실패
- `409 Conflict`: 동일한 이름의 카테고리 존재

---

### 3.2 카테고리 목록 조회 🔒

**Endpoint:** `GET /api/category`

**설명:** 사용자의 모든 카테고리를 조회합니다.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "식비",
      "type": 0,
      "level": 1,
      "parent_id": null,
      "user_id": 1
    },
    {
      "id": 2,
      "name": "편의점",
      "type": 0,
      "level": 2,
      "parent_id": 1,
      "user_id": 1
    }
  ]
}
```

**Error Responses:**
- `401 Unauthorized`: 인증 실패

---

### 3.3 카테고리 수정 🔒

**Endpoint:** `PUT /api/category/:id`

**설명:** 카테고리 정보를 수정합니다.

**Headers:**
```
Authorization: Bearer {token}
```

**URL Parameters:**
- `id`: 카테고리 ID (숫자)

**Request Body:**
```json
{
  "name": "외식비",
  "parent_id": 1
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "name": "외식비",
    "type": 0,
    "level": 2,
    "parent_id": 1,
    "user_id": 1
  }
}
```

**Error Responses:**
- `400 Bad Request`: 잘못된 데이터 형식
- `401 Unauthorized`: 인증 실패
- `403 Forbidden`: 소유권 없음
- `404 Not Found`: 카테고리를 찾을 수 없음

---

### 3.4 카테고리 삭제 🔒

**Endpoint:** `DELETE /api/category/:id`

**설명:** 카테고리를 삭제합니다.

**Headers:**
```
Authorization: Bearer {token}
```

**URL Parameters:**
- `id`: 카테고리 ID (숫자)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "name": "편의점",
    "type": 0,
    "level": 2,
    "parent_id": 1,
    "user_id": 1
  },
  "message": "카테고리가 성공적으로 삭제되었습니다."
}
```

**Error Responses:**
- `400 Bad Request`: 잘못된 ID 형식
- `401 Unauthorized`: 인증 실패
- `403 Forbidden`: 소유권 없음
- `404 Not Found`: 카테고리를 찾을 수 없음

---

## 4. 가계부 내역 관리 (Receipt Management)

### 4.1 거래 내역 생성 🔒

**Endpoint:** `POST /api/receipt`

**설명:** 새로운 거래 내역(지출/수입/이체)을 생성합니다.

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body (지출 - type: 0):**
```json
{
  "type": 0,
  "cost": 5000,
  "content": "편의점 간식",
  "location": "GS25 강남점",
  "user_id": 1,
  "asset_id": 1,
  "category_id": 2
}
```

**Request Body (수입 - type: 1):**
```json
{
  "type": 1,
  "cost": 100000,
  "content": "월급",
  "user_id": 1,
  "asset_id": 2,
  "category_id": 5
}
```

**Request Body (이체 - type: 2):**
```json
{
  "type": 2,
  "cost": 50000,
  "content": "카드 결제",
  "user_id": 1,
  "asset_id": 1,
  "trs_asset_id": 2,
  "category_id": null
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "type": 0,
    "cost": 5000,
    "content": "편의점 간식",
    "location": "GS25 강남점",
    "user_id": 1,
    "asset_id": 1,
    "trs_asset_id": null,
    "category_id": 2,
    "created_at": "2024-01-15T14:30:00Z",
    "updated_at": "2024-01-15T14:30:00Z"
  }
}
```

**필드 설명:**
- `type`: 0 (지출), 1 (수입), 2 (이체)
- `cost`: 금액 (숫자)
- `content`: 내용/메모
- `location`: 장소 (선택사항)
- `asset_id`: 사용 자산 ID
- `trs_asset_id`: 이체 대상 자산 ID (이체 시에만 필요)
- `category_id`: 카테고리 ID

**자산 잔액 변화:**
- 지출(0): `asset_id` 잔액 `-cost`
- 수입(1): `asset_id` 잔액 `+cost`
- 이체(2): `asset_id` 잔액 `-cost`, `trs_asset_id` 잔액 `+cost`

**Error Responses:**
- `400 Bad Request`: 필수 필드 누락 또는 형식 오류
- `401 Unauthorized`: 인증 실패

---

### 4.2 거래 내역 목록 조회 🔒

**Endpoint:** `GET /api/receipt`

**설명:** 사용자의 모든 거래 내역을 조회합니다.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "type": 0,
      "cost": 5000,
      "content": "편의점 간식",
      "location": "GS25 강남점",
      "user_id": 1,
      "asset_id": 1,
      "trs_asset_id": null,
      "category_id": 2,
      "created_at": "2024-01-15T14:30:00Z",
      "updated_at": "2024-01-15T14:30:00Z"
    }
  ]
}
```

**Error Responses:**
- `401 Unauthorized`: 인증 실패

---

### 4.3 거래 내역 상세 조회 🔒

**Endpoint:** `GET /api/receipt/:id`

**설명:** 특정 거래 내역의 상세 정보를 조회합니다.

**Headers:**
```
Authorization: Bearer {token}
```

**URL Parameters:**
- `id`: 거래 내역 ID (숫자)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "type": 0,
    "cost": 5000,
    "content": "편의점 간식",
    "location": "GS25 강남점",
    "user_id": 1,
    "asset_id": 1,
    "trs_asset_id": null,
    "category_id": 2,
    "created_at": "2024-01-15T14:30:00Z",
    "updated_at": "2024-01-15T14:30:00Z"
  }
}
```

**Error Responses:**
- `400 Bad Request`: 잘못된 ID 형식
- `401 Unauthorized`: 인증 실패
- `404 Not Found`: 거래 내역을 찾을 수 없음

---

### 4.4 거래 내역 수정 🔒

**Endpoint:** `PUT /api/receipt/:id`

**설명:** 거래 내역을 수정합니다. 금액 변경 시 자산 잔액이 자동으로 조정됩니다.

**Headers:**
```
Authorization: Bearer {token}
```

**URL Parameters:**
- `id`: 거래 내역 ID (숫자)

**Request Body:**
```json
{
  "cost": 6000,
  "content": "편의점 간식 및 음료",
  "location": "GS25 강남점"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "type": 0,
    "cost": 6000,
    "content": "편의점 간식 및 음료",
    "location": "GS25 강남점",
    "user_id": 1,
    "asset_id": 1,
    "trs_asset_id": null,
    "category_id": 2,
    "created_at": "2024-01-15T14:30:00Z",
    "updated_at": "2024-01-15T15:00:00Z"
  }
}
```

**Error Responses:**
- `400 Bad Request`: 잘못된 데이터 형식
- `401 Unauthorized`: 인증 실패
- `403 Forbidden`: 소유권 없음
- `404 Not Found`: 거래 내역을 찾을 수 없음

---

### 4.5 거래 내역 삭제 🔒

**Endpoint:** `DELETE /api/receipt/:id`

**설명:** 거래 내역을 삭제합니다. 자산 잔액이 자동으로 복구됩니다.

**Headers:**
```
Authorization: Bearer {token}
```

**URL Parameters:**
- `id`: 거래 내역 ID (숫자)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "type": 0,
    "cost": 5000,
    "content": "편의점 간식",
    "location": "GS25 강남점",
    "user_id": 1,
    "asset_id": 1,
    "trs_asset_id": null,
    "category_id": 2
  },
  "message": "거래 내역이 성공적으로 삭제되었습니다."
}
```

**Error Responses:**
- `400 Bad Request`: 잘못된 ID 형식
- `401 Unauthorized`: 인증 실패
- `403 Forbidden`: 소유권 없음
- `404 Not Found`: 거래 내역을 찾을 수 없음

---

## 5. 통계 및 분석 (Statistics)

> **구현 상태**: 부분 구현 (월별 통계, 카테고리별 통계 완료)

### 5.1 월별 지출/수입 통계 조회 🔒

**Endpoint:** `GET /api/statistics/monthly?year={year}&month={month}`

**설명:** 특정 월의 지출/수입 통계를 조회합니다.

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `year`: 연도 (필수, 예: 2024)
- `month`: 월 (필수, 1-12)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "year": 2024,
    "month": 1,
    "totalExpenditure": 150000,
    "totalIncome": 300000,
    "balance": 150000,
    "transactionCount": 25
  }
}
```

**필드 설명:**
- `totalExpenditure`: 총 지출 금액
- `totalIncome`: 총 수입 금액
- `balance`: 수입 - 지출 (양수: 흑자, 음수: 적자)
- `transactionCount`: 거래 건수 (지출 + 수입)

**Error Responses:**
- `400 Bad Request`: 필수 쿼리 파라미터 누락 또는 잘못된 형식
  ```json
  {
    "success": false,
    "message": "연도 (year) 필드가 올바르지 않습니다."
  }
  ```
- `401 Unauthorized`: 인증 실패

---

### 5.2 카테고리별 지출/수입 분석 🔒

**Endpoint:** `GET /api/statistics/category?year={year}&month={month}&type={type}`

**설명:** 특정 월의 카테고리별 지출/수입 통계를 조회합니다.

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `year`: 연도 (필수, 예: 2024)
- `month`: 월 (필수, 1-12)
- `type`: 거래 유형 (선택, 0=지출, 1=수입, 기본값: 0)

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "categoryId": 1,
      "categoryName": "식비",
      "categoryLevel": 1,
      "parentId": null,
      "totalAmount": 80000,
      "transactionCount": 15,
      "percentage": 53.33
    },
    {
      "categoryId": 2,
      "categoryName": "교통비",
      "categoryLevel": 1,
      "parentId": null,
      "totalAmount": 50000,
      "transactionCount": 8,
      "percentage": 33.33
    },
    {
      "categoryId": 3,
      "categoryName": "문화생활",
      "categoryLevel": 1,
      "parentId": null,
      "totalAmount": 20000,
      "transactionCount": 2,
      "percentage": 13.33
    }
  ]
}
```

**필드 설명:**
- `categoryId`: 카테고리 ID
- `categoryName`: 카테고리 이름
- `categoryLevel`: 카테고리 계층 레벨 (1, 2, 3)
- `parentId`: 부모 카테고리 ID (1단계는 null)
- `totalAmount`: 해당 카테고리의 총 금액
- `transactionCount`: 거래 건수
- `percentage`: 전체 지출/수입 대비 비율 (%)

**특징:**
- 금액이 0인 카테고리는 결과에 포함되지 않음
- 금액이 큰 순서대로 정렬됨
- 비율은 소수점 둘째 자리까지 표시

**Error Responses:**
- `400 Bad Request`: 필수 쿼리 파라미터 누락 또는 잘못된 형식
- `401 Unauthorized`: 인증 실패

---

### 5.3 최근 N개월 월별 통계 조회 🔒

**Endpoint:** `GET /api/statistics/recent?months={months}`

**설명:** 최근 N개월의 월별 지출/수입 통계를 조회합니다.

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `months`: 조회할 개월 수 (선택, 기본값: 6, 범위: 1-12)

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "year": 2024,
      "month": 1,
      "totalExpenditure": 150000,
      "totalIncome": 300000,
      "balance": 150000,
      "transactionCount": 25
    },
    {
      "year": 2023,
      "month": 12,
      "totalExpenditure": 180000,
      "totalIncome": 280000,
      "balance": 100000,
      "transactionCount": 30
    }
  ]
}
```

**특징:**
- 최근 월부터 과거 순으로 정렬
- 그래프 표시에 적합한 형식
- 프론트엔드에서 월별 추이 분석에 활용

**Error Responses:**
- `400 Bad Request`: 잘못된 개월 수 (1-12 범위 벗어남)
- `401 Unauthorized`: 인증 실패

---

### 5.4 카테고리별 월별 지출 추이 조회 🔒

**Endpoint:** `GET /api/statistics/category/:id/trend?months={months}`

**설명:** 특정 카테고리의 최근 N개월 지출 추이를 조회합니다.

**Headers:**
```
Authorization: Bearer {token}
```

**URL Parameters:**
- `id`: 카테고리 ID (필수)

**Query Parameters:**
- `months`: 조회할 개월 수 (선택, 기본값: 6, 범위: 1-12)

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "year": 2024,
      "month": 1,
      "totalAmount": 80000
    },
    {
      "year": 2023,
      "month": 12,
      "totalAmount": 75000
    },
    {
      "year": 2023,
      "month": 11,
      "totalAmount": 90000
    }
  ]
}
```

**특징:**
- 특정 카테고리의 지출 패턴 분석에 활용
- 최근 월부터 과거 순으로 정렬
- 지출만 집계 (type = 0)

**Error Responses:**
- `400 Bad Request`: 잘못된 카테고리 ID 또는 개월 수
- `401 Unauthorized`: 인증 실패

---

## 6. 검색 및 필터링 (Search & Filter)

> **구현 상태**: 미구현

### 6.1 거래 내역 검색 🔒

**Endpoint:** `GET /api/receipt/search?keyword={keyword}`

**설명:** 키워드로 거래 내역을 검색합니다.

**구현 예정**

---

### 6.2 거래 내역 필터링 🔒

**Endpoint:** `GET /api/receipt/filter?startDate={date}&endDate={date}&categoryId={id}&assetId={id}`

**설명:** 조건에 따라 거래 내역을 필터링합니다.

**구현 예정**

---

## 7. 예산 관리 (Budget Management)

> **구현 상태**: 미구현

**구현 예정**

---

## 8. 영수증 OCR (Receipt OCR)

> **구현 상태**: 미구현 (핵심 기능)

### 8.1 영수증 이미지 업로드 🔒

**Endpoint:** `POST /api/receipt/ocr/upload`

**설명:** 영수증 이미지를 업로드하고 OCR 처리를 요청합니다.

**구현 예정**

---

### 8.2 OCR 결과 조회 🔒

**Endpoint:** `GET /api/receipt/ocr/:id`

**설명:** OCR 처리 결과를 조회합니다.

**구현 예정**

---

### 8.3 OCR 품목 일괄 등록 🔒

**Endpoint:** `POST /api/receipt/ocr/:id/register`

**설명:** OCR로 추출된 품목들을 거래 내역으로 일괄 등록합니다.

**구현 예정**

---

## 공통 에러 응답

모든 API는 다음과 같은 공통 에러 형식을 사용합니다:

**에러 응답 형식:**
```json
{
  "success": false,
  "message": "에러 메시지",
  "error": {
    "code": "ERROR_CODE",
    "details": "상세 에러 정보"
  }
}
```

**HTTP 상태 코드:**
- `200 OK`: 요청 성공 (조회, 수정, 삭제)
- `201 Created`: 리소스 생성 성공
- `400 Bad Request`: 잘못된 요청 (필드 누락, 형식 오류)
- `401 Unauthorized`: 인증 실패
- `403 Forbidden`: 권한 없음
- `404 Not Found`: 리소스를 찾을 수 없음
- `409 Conflict`: 리소스 충돌 (중복)
- `500 Internal Server Error`: 서버 내부 오류

---

## API 명세서 작성 가이드

백엔드 기능 개발 완료 시 다음 정보를 반드시 포함해야 합니다:

1. **Endpoint**: HTTP 메서드 및 경로
2. **설명**: API의 목적
3. **인증 요구사항**: 🔒 또는 🔓
4. **Headers**: 필요한 헤더 (Authorization 등)
5. **URL Parameters**: 경로 파라미터
6. **Query Parameters**: 쿼리 스트링 파라미터
7. **Request Body**: 요청 본문 (JSON 예시)
8. **Response**: 성공 응답 (JSON 예시)
9. **Error Responses**: 가능한 모든 에러 응답
10. **필드 설명**: 중요한 필드의 의미 및 제약사항
11. **검증 규칙**: 입력값 검증 규칙
12. **부가 효과**: 자산 잔액 변화 등의 부수 효과

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
- `400 Bad Request`: 설명
- `401 Unauthorized`: 설명
```
