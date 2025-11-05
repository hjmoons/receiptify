import { Router } from 'express';
import { CategoryController } from '../controllers/category.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Category:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 카테고리 ID
 *         name:
 *           type: string
 *           description: 카테고리명
 *         type:
 *           type: integer
 *           description: 카테고리 유형 (0 지출, 1 수입)
 *         level:
 *           type: integer
 *           description: 카테고리 레벨 (1, 2, 3)
 *         parent_id:
 *           type: integer
 *           nullable: true
 *           description: 부모 카테고리 ID
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
 *         name: "식비"
 *         type: 0
 *         level: 1
 *         parent_id: null
 *         created_at: "2025-01-01T00:00:00Z"
 *         updated_at: "2025-01-01T00:00:00Z"
 *         user_id: 1
 *     
 *     CreateCategoryDTO:
 *       type: object
 *       required:
 *         - name
 *         - type
 *         - level
 *         - user_id
 *       properties:
 *         name:
 *           type: string
 *           description: 카테고리명
 *         type:
 *           type: integer
 *           description: 카테고리 유형 (0 지출, 1 수입)
 *         level:
 *           type: integer
 *           description: 카테고리 레벨 (1, 2, 3)
 *         parent_id:
 *           type: integer
 *           nullable: true
 *           description: 부모 카테고리 ID
 *         user_id:
 *           type: integer
 *           description: 사용자 ID
 *       example:
 *         name: "식비"
 *         type: 0
 *         level: 1
 *         parent_id: null
 *         user_id: 1
 *     
 *     UpdateCategoryDTO:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: 카테고리명
 *         parent_id:
 *           type: integer
 *           nullable: true
 *           description: 부모 카테고리 ID
 *       example:
 *         name: "외식비"
 *         parent_id: 1
 *     
 *     CategoryTree:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 카테고리 ID
 *         name:
 *           type: string
 *           description: 카테고리명
 *         type:
 *           type: integer
 *           description: 카테고리 유형 (0 지출, 1 수입)
 *         level:
 *           type: integer
 *           description: 카테고리 레벨
 *         children:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CategoryTree'
 *           description: 하위 카테고리 목록
 *       example:
 *         id: 1
 *         name: "식비"
 *         type: 0
 *         level: 1
 *         children:
 *           - id: 2
 *             name: "외식"
 *             type: 0
 *             level: 2
 *             children: []
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
 *                 example: "카테고리를 찾을 수 없습니다."
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
 * /api/category:
 *   post:
 *     summary: 새 카테고리 생성
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCategoryDTO'
 *     responses:
 *       201:
 *         description: 카테고리가 성공적으로 생성됨
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/', authMiddleware, CategoryController.create);

/**
 * @swagger
 * /api/category/type:
 *   get:
 *     summary: 타입별 카테고리 목록 조회
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         required: true
 *         schema:
 *           type: integer
 *           enum: [0, 1]
 *         description: 카테고리 유형 (0 지출, 1 수입)
 *     responses:
 *       200:
 *         description: 타입별 카테고리 목록 반환
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Category'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 */
router.get('/type', authMiddleware, CategoryController.getListByType);

/**
 * @swagger
 * /api/category/{parentId}/children:
 *   get:
 *     summary: 특정 카테고리의 하위 카테고리 조회
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: parentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 부모 카테고리 ID
 *     responses:
 *       200:
 *         description: 하위 카테고리 목록 반환
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Category'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/:parentId/children', authMiddleware, CategoryController.getChildren);

/**
 * @swagger
 * /api/category/{id}:
 *   get:
 *     summary: 특정 카테고리 조회
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 카테고리 ID
 *     responses:
 *       200:
 *         description: 카테고리 정보 반환
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get('/:id', authMiddleware, CategoryController.get);

/**
 * @swagger
 * /api/category:
 *   get:
 *     summary: 사용자의 모든 카테고리 조회
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 사용자의 카테고리 목록 반환
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Category'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/', authMiddleware, CategoryController.getList);

/**
 * @swagger
 * /api/category/{id}:
 *   put:
 *     summary: 카테고리 정보 수정
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 카테고리 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             allOf:
 *               - $ref: '#/components/schemas/UpdateCategoryDTO'
 *               - type: object
 *                 required:
 *                   - user_id
 *                 properties:
 *                   user_id:
 *                     type: integer
 *                     description: 사용자 ID
 *     responses:
 *       200:
 *         description: 카테고리가 성공적으로 수정됨
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.put('/:id', authMiddleware, CategoryController.update);

/**
 * @swagger
 * /api/category/{id}:
 *   delete:
 *     summary: 카테고리 삭제
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 카테고리 ID
 *     responses:
 *       200:
 *         description: 카테고리가 성공적으로 삭제됨
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.delete('/:id', authMiddleware, CategoryController.delete);

export default router;