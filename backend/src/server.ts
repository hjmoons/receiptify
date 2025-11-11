import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import userRoutes from './routes/user.route';
import assetRoutes from './routes/asset.route';
import categoryRoutes from './routes/category.route';
import receiptRoutes from './routes/receipt.route';
import statisticsRoutes from './routes/statistics.route';
import { errorHandler } from './middlewares/error.handler';
import { apiLimiter } from './middlewares/rate-limit.middleware';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// 보안 미들웨어
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// CORS 미들웨어
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());

// Rate limiting - 모든 API 요청에 적용
app.use('/api/', apiLimiter);

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Receiptify API Docs'
}));

// API 문서 JSON
app.get('/api-docs.json', (_req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// 라우트
app.use('/api/auth', userRoutes);
app.use('/api/asset', assetRoutes);
app.use('/api/category', categoryRoutes);
app.use('/api/receipt', receiptRoutes);
app.use('/api/statistics', statisticsRoutes);
app.use(errorHandler);

app.get('/api', (_req, res) => {
  res.json({ message: 'Receiptify API' });
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
  console.log(`📚 API Docs: http://localhost:${PORT}/api-docs`);
});