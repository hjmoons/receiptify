import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
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

app.get('/api', (req, res) => {
  res.json({ message: 'Receiptify API' });
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});