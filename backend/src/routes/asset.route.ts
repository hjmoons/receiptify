import express from 'express';
import { AssetController } from '../controllers/asset.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Asset:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 자산 ID
 *         name:
 *           type: string
 *           description: 자산명
 *         type:
 *           type: string
 *           description: 자산 유형
 *         balance:
 *           type: number
 *           description: 자산 잔액
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
 *       example:
 *         id: 1
 *         name: "신한은행 적금"
 *         type: "savings"
 *         balance: 1000000
 *         created_at: "2025-01-01T00:00:00Z"
 *         updated_at: "2025-01-01T00:00:00Z"
 *         user_id: 1
 *     
 *     CreateAssetDTO:
 *       type: object
 *       required:
 *         - name
 *         - type
 *         - balance
 *         - user_id
 *       properties:
 *         name:
 *           type: string
 *           description: 자산명
 *         type:
 *           type: string
 *           description: 자산 유형
 *         balance:
 *           type: number
 *           description: 자산 잔액
 *         user_id:
 *           type: integer
 *           description: 사용자 ID
 *       example:
 *         name: "신한은행 적금"
 *         type: "savings"
 *         balance: 1000000
 *         user_id: 1
 *     
 *     UpdateAssetDTO:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: 자산명
 *         type:
 *           type: string
 *           description: 자산 유형
 *         balance:
 *           type: number
 *           description: 자산 잔액
 *       example:
 *         name: "신한은행 적금 수정"
 *         balance: 1200000
 *   
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   
 *   responses:
 *     UnauthorizedError:
 *       description: 인증 토큰이 없거나 유효하지 않음
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               error:
 *                 type: string
 *                 example: "인증이 필요합니다."
 *     
 *     ForbiddenError:
 *       description: 권한이 없음
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               error:
 *                 type: string
 *                 example: "권한이 없습니다."
 *     
 *     NotFoundError:
 *       description: 리소스를 찾을 수 없음
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               error:
 *                 type: string
 *                 example: "자산을 찾을 수 없습니다."
 *     
 *     ValidationError:
 *       description: 요청 데이터 검증 실패
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               error:
 *                 type: string
 *                 example: "유효하지 않은 데이터입니다."
 */

/**
 * @swagger
 * /api/asset:
 *   post:
 *     summary: 새 자산 생성
 *     tags: [Assets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAssetDTO'
 *     responses:
 *       201:
 *         description: 자산이 성공적으로 생성됨
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Asset'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/', authMiddleware, AssetController.create);

/**
 * @swagger
 * /api/asset/total:
 *   get:
 *     summary: 로그인된 사용자의 총 자산 가치 조회
 *     tags: [Assets]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 총 자산 가치 반환
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalValue:
 *                   type: number
 *                   description: 총 자산 가치
 *                   example: 5000000
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/total', authMiddleware, AssetController.getTotalAssetValue);

/**
 * @swagger
 * /api/asset/{id}:
 *   get:
 *     summary: 특정 자산 조회
 *     tags: [Assets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 자산 ID
 *     responses:
 *       200:
 *         description: 자산 정보 반환
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Asset'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get('/:id', authMiddleware, AssetController.get);

/**
 * @swagger
 * /api/asset:
 *   get:
 *     summary: 로그인된 사용자의 모든 자산 조회
 *     tags: [Assets]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 사용자의 자산 목록 반환
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Asset'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/', authMiddleware, AssetController.getList);

/**
 * @swagger
 * /api/asset/{id}:
 *   put:
 *     summary: 자산 정보 수정
 *     tags: [Assets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 자산 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateAssetDTO'
 *     responses:
 *       200:
 *         description: 자산이 성공적으로 수정됨
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Asset'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.put('/:id', authMiddleware, AssetController.update);

/**
 * @swagger
 * /api/asset/{id}:
 *   delete:
 *     summary: 자산 삭제
 *     tags: [Assets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 자산 ID
 *     responses:
 *       200:
 *         description: 자산이 성공적으로 삭제됨
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Asset'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.delete('/:id', authMiddleware, AssetController.delete);

export default router;