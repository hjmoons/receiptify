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

# TypeScript 및 개발 도구
npm install -D typescript @types/node tsx nodemon

# Express 및 관련 패키지
npm install express cors dotenv
npm install -D @types/express @types/cors

# 인증 관련
npm install bcryptjs jsonwebtoken
npm install -D @types/bcryptjs @types/jsonwebtoken

# 데이터베이스
npm install better-sqlite3
npm install -D @types/better-sqlite3
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
