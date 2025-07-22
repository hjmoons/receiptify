# 개발 세팅

## BackEnd

```sh
# receiptify 폴더로 이동
cd receiptify

# backend 폴더 생성 및 이동
mkdir backend
cd backend

# package.json 생성
npm init -y

# 기본 서버 패키지
npm install express cors dotenv
npm install mongoose  # MongoDB 사용시
# 또는
npm install pg        # PostgreSQL 사용시

# 인증 관련
npm install jsonwebtoken bcryptjs

# 파일 업로드 (영수증 이미지)
npm install multer

# 개발 도구
npm install -D nodemon @types/node

# 폴더 구조 생성
mkdir src
mkdir src/routes
mkdir src/controllers
mkdir src/models
mkdir src/middleware
mkdir src/utils
mkdir uploads  # 영수증 이미지 임시 저장
```

## FrontEnd

```sh
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install

npm install react-router-dom axios
npm install -D tailwindcss@3.4.17 postcss autoprefixer
npx tailwindcss init -p
```
