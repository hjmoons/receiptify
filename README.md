# Receiptify (미개발)

AI 기반 영수증 스캔 가계부 앱

## 주요 기능
- 📸 영수증 사진 촬영 및 자동 인식
- 🤖 AI를 활용한 영수증 데이터 추출
- 📊 지출 분석 및 통계
- 💰 예산 관리 및 추적
- 📱 반응형 웹 디자인

## 기술 스택

### Frontend
- React
- Tailwind CSS
- Chart.js (데이터 시각화)

### Backend
- Node.js
- Express
- PostgreSQL

### AI Service
- Python
- FastAPI
- OpenAI/Claude API
- Tesseract OCR

## 시작하기

### 필수 요구사항
- Node.js 18+
- Python 3.9+
- PostgreSQL 14+

### 설치 방법

```bash
# 레포지토리 클론
git clone https://github.com/[your-username]/receiptify.git
cd receiptify

# 전체 서비스 실행 (Docker)
docker-compose up

# 또는 개별 실행
# Frontend
cd frontend && npm install && npm start

# Backend
cd backend && npm install && npm run dev

# AI Service
cd ai-service && pip install -r requirements.txt && uvicorn main:app --reload
