/**
 * 파일명: statistics.route.ts
 * 설명: 통계 API 라우트 정의
 * 작성일: 2025-01-10
 */

import { Router } from "express";
import { StatisticsController } from "../controllers/statistics.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Statistics
 *   description: 통계 및 분석 API
 */

/**
 * @swagger
 * /api/statistics/monthly:
 *   get:
 *     summary: 월별 지출/수입 통계 조회
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: year
 *         required: true
 *         schema:
 *           type: integer
 *         description: 연도
 *       - in: query
 *         name: month
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 12
 *         description: 월
 *     responses:
 *       200:
 *         description: 월별 통계 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     year:
 *                       type: integer
 *                       example: 2024
 *                     month:
 *                       type: integer
 *                       example: 1
 *                     totalExpenditure:
 *                       type: integer
 *                       example: 150000
 *                     totalIncome:
 *                       type: integer
 *                       example: 300000
 *                     balance:
 *                       type: integer
 *                       example: 150000
 *                     transactionCount:
 *                       type: integer
 *                       example: 25
 *       400:
 *         description: 잘못된 요청
 *       401:
 *         description: 인증 실패
 */
router.get('/monthly', authMiddleware, StatisticsController.getMonthlyStats);

/**
 * @swagger
 * /api/statistics/category:
 *   get:
 *     summary: 카테고리별 지출/수입 통계 조회
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: year
 *         required: true
 *         schema:
 *           type: integer
 *         description: 연도
 *       - in: query
 *         name: month
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 12
 *         description: 월
 *       - in: query
 *         name: type
 *         schema:
 *           type: integer
 *           enum: [0, 1]
 *           default: 0
 *         description: 거래 유형
 *     responses:
 *       200:
 *         description: 카테고리별 통계 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       categoryId:
 *                         type: integer
 *                         example: 1
 *                       categoryName:
 *                         type: string
 *                         example: 식비
 *                       categoryLevel:
 *                         type: integer
 *                         example: 1
 *                       parentId:
 *                         type: integer
 *                         nullable: true
 *                         example: null
 *                       totalAmount:
 *                         type: integer
 *                         example: 80000
 *                       transactionCount:
 *                         type: integer
 *                         example: 15
 *                       percentage:
 *                         type: number
 *                         format: float
 *                         example: 53.33
 *       400:
 *         description: 잘못된 요청
 *       401:
 *         description: 인증 실패
 */
router.get('/category', authMiddleware, StatisticsController.getCategoryStats);

/**
 * @swagger
 * /api/statistics/recent:
 *   get:
 *     summary: 최근 N개월 월별 통계 조회
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: months
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 12
 *           default: 6
 *         description: 조회할 개월 수
 *     responses:
 *       200:
 *         description: 최근 월별 통계 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       year:
 *                         type: integer
 *                         example: 2024
 *                       month:
 *                         type: integer
 *                         example: 1
 *                       totalExpenditure:
 *                         type: integer
 *                         example: 150000
 *                       totalIncome:
 *                         type: integer
 *                         example: 300000
 *                       balance:
 *                         type: integer
 *                         example: 150000
 *                       transactionCount:
 *                         type: integer
 *                         example: 25
 *       400:
 *         description: 잘못된 요청
 *       401:
 *         description: 인증 실패
 */
router.get('/recent', authMiddleware, StatisticsController.getRecentMonthlyStats);

/**
 * @swagger
 * /api/statistics/category/{id}/trend:
 *   get:
 *     summary: 특정 카테고리의 월별 지출/수입 추이 조회
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 카테고리 ID
 *       - in: query
 *         name: type
 *         required: true
 *         schema:
 *           type: integer
 *           enum: [0, 1]
 *         description: 거래 유형
 *       - in: query
 *         name: months
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 12
 *           default: 6
 *         description: 조회할 개월 수
 *     responses:
 *       200:
 *         description: 카테고리 추이 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       year:
 *                         type: integer
 *                         example: 2024
 *                       month:
 *                         type: integer
 *                         example: 1
 *                       totalAmount:
 *                         type: integer
 *                         example: 80000
 *       400:
 *         description: 잘못된 요청
 *       401:
 *         description: 인증 실패
 */
router.get('/category/:id/trend', authMiddleware, StatisticsController.getCategoryTrend);

/**
 * @swagger
 * /api/statistics/top:
 *   get:
 *     summary: 이번 달 Top N 카테고리 조회
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: year
 *         required: true
 *         schema:
 *           type: integer
 *         description: 연도
 *       - in: query
 *         name: month
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 12
 *         description: 월
 *       - in: query
 *         name: type
 *         required: true
 *         schema:
 *           type: integer
 *           enum: [0, 1]
 *         description: 거래 유형
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 20
 *           default: 5
 *         description: 조회할 개수
 *     responses:
 *       200:
 *         description: Top N 카테고리 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       categoryId:
 *                         type: integer
 *                         example: 2
 *                       categoryName:
 *                         type: string
 *                         example: 외식
 *                       categoryLevel:
 *                         type: integer
 *                         example: 2
 *                       parentId:
 *                         type: integer
 *                         example: 1
 *                       totalAmount:
 *                         type: integer
 *                         example: 150000
 *                       transactionCount:
 *                         type: integer
 *                         example: 12
 *                       percentage:
 *                         type: number
 *                         format: float
 *                         example: 35.5
 *       400:
 *         description: 잘못된 요청
 *       401:
 *         description: 인증 실패
 */
router.get('/top', authMiddleware, StatisticsController.getTopCategories);

export default router;
