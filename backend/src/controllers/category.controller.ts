import { Request, Response } from 'express';
import { CategoryService } from '../services/category.service';
import { CreateDTO, UpdateDTO } from '../types/category.type';
import {
    DuplicateError,
    CreateError,
    UpdateError,
    DeleteError,
} from "../errors/category.error";
import {
    NotFoundError,
    PermissionError
} from "../errors/common.error";

export class CategoryController {
    // 카테고리 생성
    static async create(req: Request, res: Response): Promise<void> {
        try {
            const categoryData: CreateDTO = req.body;
            
            // 입력 값 검증
            if (!categoryData.name || !categoryData.type || !categoryData.level || !categoryData.user_id) {
                res.status(400).json({
                    success: false,
                    message: '필수 입력값이 누락되었습니다. (name, type, level, user_id)'
                });
                return;
            }

            // level 값 검증 (1, 2, 3만 허용)
            if (![1, 2, 3].includes(categoryData.level)) {
                res.status(400).json({
                    success: false,
                    message: 'level은 1, 2, 3 중 하나여야 합니다.'
                });
                return;
            }

            // type 값 검증 (0: 지출, 1: 수입)
            if (![0, 1].includes(categoryData.type)) {
                res.status(400).json({
                    success: false,
                    message: 'type은 0(지출) 또는 1(수입)이어야 합니다.'
                });
                return;
            }

            const category = await CategoryService.create(categoryData);
            
            res.status(201).json({
                success: true,
                message: '카테고리가 성공적으로 생성되었습니다.',
                data: category
            });

        } catch (error) {
            console.error('카테고리 생성 오류:', error);
            
            if (error instanceof DuplicateError) {
                res.status(409).json({
                    success: false,
                    message: error.message
                });
            } else if (error instanceof CreateError) {
                res.status(500).json({
                    success: false,
                    message: error.message
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: '카테고리 생성 중 오류가 발생했습니다.'
                });
            }
        }
    }

    // 카테고리 조회 (단일)
    static async get(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            
            if (isNaN(id)) {
                res.status(400).json({
                    success: false,
                    message: '유효하지 않은 카테고리 ID입니다.'
                });
                return;
            }

            const category = await CategoryService.get(id);
            
            res.status(200).json({
                success: true,
                data: category
            });

        } catch (error) {
            console.error('카테고리 조회 오류:', error);
            
            if (error instanceof NotFoundError) {
                res.status(404).json({
                    success: false,
                    message: error.message
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: '카테고리 조회 중 오류가 발생했습니다.'
                });
            }
        }
    }

    // 카테고리 목록 조회 (사용자별)
    static async getList(req: Request, res: Response): Promise<void> {
        try {
            const userId = parseInt(req.query.user_id as string);
            
            if (isNaN(userId)) {
                res.status(400).json({
                    success: false,
                    message: '유효하지 않은 사용자 ID입니다.'
                });
                return;
            }

            const categories = await CategoryService.getList(userId);
            
            res.status(200).json({
                success: true,
                data: categories
            });

        } catch (error) {
            console.error('카테고리 목록 조회 오류:', error);
            
            res.status(500).json({
                success: false,
                message: '카테고리 목록 조회 중 오류가 발생했습니다.'
            });
        }
    }

    // 카테고리 목록 조회 (타입별)
    static async getListByType(req: Request, res: Response): Promise<void> {
        try {
            const userId = parseInt(req.query.user_id as string);
            const type = parseInt(req.query.type as string);
            
            if (isNaN(userId) || isNaN(type)) {
                res.status(400).json({
                    success: false,
                    message: '유효하지 않은 user_id 또는 type입니다.'
                });
                return;
            }

            if (![0, 1].includes(type)) {
                res.status(400).json({
                    success: false,
                    message: 'type은 0(지출) 또는 1(수입)이어야 합니다.'
                });
                return;
            }

            const categories = await CategoryService.getListByType(userId, type);
            
            res.status(200).json({
                success: true,
                data: categories
            });

        } catch (error) {
            console.error('타입별 카테고리 목록 조회 오류:', error);
            
            res.status(500).json({
                success: false,
                message: '타입별 카테고리 목록 조회 중 오류가 발생했습니다.'
            });
        }
    }

    // 계층형 카테고리 트리 조회
    static async getCategoryTree(req: Request, res: Response): Promise<void> {
        try {
            const userId = parseInt(req.query.user_id as string);
            const type = parseInt(req.query.type as string);
            
            if (isNaN(userId) || isNaN(type)) {
                res.status(400).json({
                    success: false,
                    message: '유효하지 않은 user_id 또는 type입니다.'
                });
                return;
            }

            if (![0, 1].includes(type)) {
                res.status(400).json({
                    success: false,
                    message: 'type은 0(지출) 또는 1(수입)이어야 합니다.'
                });
                return;
            }

            const categories = await CategoryService.getCategoryTree(userId, type);
            
            res.status(200).json({
                success: true,
                data: categories
            });

        } catch (error) {
            console.error('카테고리 트리 조회 오류:', error);
            
            res.status(500).json({
                success: false,
                message: '카테고리 트리 조회 중 오류가 발생했습니다.'
            });
        }
    }

    // 하위 카테고리 조회
    static async getChildren(req: Request, res: Response): Promise<void> {
        try {
            const parentId = parseInt(req.params.parentId);
            
            if (isNaN(parentId)) {
                res.status(400).json({
                    success: false,
                    message: '유효하지 않은 부모 카테고리 ID입니다.'
                });
                return;
            }

            const categories = await CategoryService.getChildren(parentId);
            
            res.status(200).json({
                success: true,
                data: categories
            });

        } catch (error) {
            console.error('하위 카테고리 조회 오류:', error);
            
            res.status(500).json({
                success: false,
                message: '하위 카테고리 조회 중 오류가 발생했습니다.'
            });
        }
    }

    // 카테고리 수정
    static async update(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            const userId = parseInt(req.body.user_id);
            
            if (isNaN(id) || isNaN(userId)) {
                res.status(400).json({
                    success: false,
                    message: '유효하지 않은 ID 또는 사용자 ID입니다.'
                });
                return;
            }

            const updateData: UpdateDTO = {
                id,
                ...req.body
            };

            const category = await CategoryService.update(updateData, userId);
            
            res.status(200).json({
                success: true,
                message: '카테고리가 성공적으로 수정되었습니다.',
                data: category
            });

        } catch (error) {
            console.error('카테고리 수정 오류:', error);
            
            if (error instanceof NotFoundError) {
                res.status(404).json({
                    success: false,
                    message: error.message
                });
            } else if (error instanceof PermissionError) {
                res.status(403).json({
                    success: false,
                    message: error.message
                });
            } else if (error instanceof DuplicateError) {
                res.status(409).json({
                    success: false,
                    message: error.message
                });
            } else if (error instanceof UpdateError) {
                res.status(500).json({
                    success: false,
                    message: error.message
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: '카테고리 수정 중 오류가 발생했습니다.'
                });
            }
        }
    }

    // 카테고리 삭제
    static async delete(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            const userId = parseInt(req.body.user_id);
            
            if (isNaN(id) || isNaN(userId)) {
                res.status(400).json({
                    success: false,
                    message: '유효하지 않은 ID 또는 사용자 ID입니다.'
                });
                return;
            }

            const deletedCategory = await CategoryService.delete(id, userId);
            
            res.status(200).json({
                success: true,
                message: '카테고리가 성공적으로 삭제되었습니다.',
                data: deletedCategory
            });

        } catch (error) {
            console.error('카테고리 삭제 오류:', error);
            
            if (error instanceof NotFoundError) {
                res.status(404).json({
                    success: false,
                    message: error.message
                });
            } else if (error instanceof PermissionError) {
                res.status(403).json({
                    success: false,
                    message: error.message
                });
            } else if (error instanceof DeleteError) {
                res.status(400).json({
                    success: false,
                    message: error.message
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: '카테고리 삭제 중 오류가 발생했습니다.'
                });
            }
        }
    }
}