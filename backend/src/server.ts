import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDB } from './config/database';
import authRoutes from './routes/auth.route';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// 미들웨어
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// 라우트
app.use('/api/auth', authRoutes);

// 기본 라우트
app.get('/api', (req, res) => {
  res.json({ message: 'Receiptify API' });
});

// 에러 핸들러
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: '서버 오류가 발생했습니다.'
  });
});

// 서버 시작
const startServer = () => {
  initDB();
  
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

startServer();