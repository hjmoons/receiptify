import { Router } from 'express';
import { ReceiptController } from '../controllers/receipt.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Receipt:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 가계부 내역 ID
 *         type:
 *           type: integer
 *           enum: [0, 1, 2]
 *           description: 거래 유형 (0 지출, 1 수입, 2 이체)
 *         cost:
 *           type: number
 *           description: 금액
 *         content:
 *           type: string
 *           description: 내용
 *         location:
 *           type: string
 *           description: 장소
 *         transaction_date:
 *           type: string
 *           format: date-time
 *           description: 거래 발생 날짜/시간
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: 생성일시
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: 수정일시
 *         user_id:
 *           type: integer
 *           description: 사용자 ID
 *         asset_id:
 *           type: integer
 *           description: 자산 ID
 *         trs_asset_id:
 *           type: integer
 *           nullable: true
 *           description: 이체 대상 자산 ID (이체일 경우에만)
 *         category_id:
 *           type: integer
 *           nullable: true
 *           description: 카테고리 ID
 *       example:
 *         id: 1
 *         type: 0
 *         cost: 15000
 *         content: "점심 식사"
 *         location: "강남역 식당"
 *         transaction_date: "2025-01-15T12:30:00Z"
 *         created_at: "2025-01-01T12:00:00Z"
 *         updated_at: "2025-01-01T12:00:00Z"
 *         user_id: 1
 *         asset_id: 1
 *         trs_asset_id: null
 *         category_id: 5
 *
 *     CreateReceiptDTO:
 *       type: object
 *       required:
 *         - type
 *         - cost
 *         - content
 *         - user_id
 *         - asset_id
 *       properties:
 *         type:
 *           type: integer
 *           enum: [0, 1, 2]
 *           description: 거래 유형
 *         cost:
 *           type: number
 *           description: 금액
 *         content:
 *           type: string
 *           description: 내용
 *         location:
 *           type: string
 *           description: 장소
 *         transaction_date:
 *           type: string
 *           format: date-time
 *           description: 거래 발생 날짜/시간 (ISO 8601 형식, 선택사항 - 미입력시 현재 시간)
 *         user_id:
 *           type: integer
 *           description: 사용자 ID
 *         asset_id:
 *           type: integer
 *           description: 자산 ID
 *         trs_asset_id:
 *           type: integer
 *           nullable: true
 *           description: 이체 대상 자산 ID
 *         category_id:
 *           type: integer
 *           nullable: true
 *           description: 카테고리 ID
 *       example:
 *         type: 0
 *         cost: 15000
 *         content: "점심 식사"
 *         location: "강남역 식당"
 *         transaction_date: "2025-01-15T12:30:00Z"
 *         user_id: 1
 *         asset_id: 1
 *         trs_asset_id: null
 *         category_id: 5
 *
 *     UpdateReceiptDTO:
 *       type: object
 *       properties:
 *         type:
 *           type: integer
 *           enum: [0, 1, 2]
 *           description: 거래 유형
 *         cost:
 *           type: number
 *           description: 금액
 *         content:
 *           type: string
 *           description: 내용
 *         location:
 *           type: string
 *           description: 장소
 *         transaction_date:
 *           type: string
 *           format: date-time
 *           description: 거래 발생 날짜/시간 (ISO 8601 형식, 선택사항)
 *         asset_id:
 *           type: integer
 *           description: 자산 ID
 *         trs_asset_id:
 *           type: integer
 *           nullable: true
 *           description: 이체 대상 자산 ID
 *         category_id:
 *           type: integer
 *           nullable: true
 *           description: 카테고리 ID
 *       example:
 *         type: 0
 *         cost: 18000
 *         content: "저녁 식사"
 *         location: "홍대 식당"
 *         transaction_date: "2025-01-15T18:30:00Z"
 *         asset_id: 1
 *         trs_asset_id: null
 *         category_id: 5
 */

/**
 * @swagger
 * /api/receipt:
 *   post:
 *     summary: 새 가계부 내역 생성
 *     tags: [Receipts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateReceiptDTO'
 *     responses:
 *       201:
 *         description: 가계부 내역이 성공적으로 생성됨
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Receipt'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/', authMiddleware, ReceiptController.create);

/**
 * @swagger
 * /api/receipt/total:
 *   get:
 *     summary: 로그인된 사용자의 총 수입/지출 조회 (월별 필터 가능)
 *     tags: [Receipts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: 조회할 연도 (예 2025)
 *       - in: query
 *         name: month
 *         schema:
 *           type: integer
 *         description: 조회할 월 (1-12)
 *     responses:
 *       200:
 *         description: 총 수입/지출 반환
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 expend:
 *                   type: number
 *                   description: 총 지출
 *                   example: 500000
 *                 income:
 *                   type: number
 *                   description: 총 수입
 *                   example: 3000000
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/total', authMiddleware, ReceiptController.getTotalExpendIncome);

/**
 * @swagger
 * /api/receipt/{id}:
 *   get:
 *     summary: 특정 가계부 내역 조회
 *     tags: [Receipts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 가계부 내역 ID
 *     responses:
 *       200:
 *         description: 가계부 내역 정보 반환
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Receipt'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get('/:id', authMiddleware, ReceiptController.get);

/**
 * @swagger
 * /api/receipt:
 *   get:
 *     summary: 로그인된 사용자의 가계부 내역 조회 (월별 필터 가능)
 *     tags: [Receipts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: 조회할 연도 (예 2025)
 *       - in: query
 *         name: month
 *         schema:
 *           type: integer
 *         description: 조회할 월 (1-12)
 *     responses:
 *       200:
 *         description: 사용자의 가계부 내역 목록 반환
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Receipt'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/', authMiddleware, ReceiptController.getList);

/**
 * @swagger
 * /api/receipt/{id}:
 *   put:
 *     summary: 가계부 내역 수정
 *     tags: [Receipts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 가계부 내역 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateReceiptDTO'
 *     responses:
 *       200:
 *         description: 가계부 내역이 성공적으로 수정됨
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Receipt'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.put('/:id', authMiddleware, ReceiptController.update);

/**
 * @swagger
 * /api/receipt/{id}:
 *   delete:
 *     summary: 가계부 내역 삭제
 *     tags: [Receipts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 가계부 내역 ID
 *     responses:
 *       200:
 *         description: 가계부 내역이 성공적으로 삭제됨
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Receipt'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.delete('/:id', authMiddleware, ReceiptController.delete);

export default router;
