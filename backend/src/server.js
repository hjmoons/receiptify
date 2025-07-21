const authRoutes = require('./routes/auth');
const receiptRoutes = require('./routes/receipts');

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// 환경변수 설정
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// 미들웨어
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/receipts', receiptRoutes);

// 라우트
app.get('/', (req, res) => {
  res.json({ message: 'Receiptify API 서버가 실행중입니다!' });
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 실행중입니다`);
});