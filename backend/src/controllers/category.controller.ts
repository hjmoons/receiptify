import e, { Request, Response, NextFunction } from 'express';
import { CategoryService } from '../services/category.service';
import { CreateDTO, UpdateDTO } from '../types/category.type';
import { createError } from '../errors/app.error';

export class CategoryController {
    // 카테고리 생성
    static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const categoryData: CreateDTO = req.body;
            
            // 입력 값 검증
            if (!categoryData.name || !(categoryData.type == 0 || categoryData.type == 1) || !(categoryData.level > 0 && categoryData.level < 4) || !categoryData.user_id) {
                throw createError.validation('name, type, level, user_id');
            }

            // level 값 검증 (1, 2, 3만 허용)
            if (![1, 2, 3].includes(categoryData.level)) {
                throw createError.validation('level은 1, 2, 3 중 하나');
            }

            // type 값 검증 (0: 지출, 1: 수입)
            if (![0, 1].includes(categoryData.type)) {
                throw createError.validation('type은 0(지출) 또는 1(수입)');
            }

            const category = await CategoryService.create(categoryData);
            
            res.status(201).json({
                success: true,
                data: category
            });

        } catch (error) {
            next(error)
        }
    }

    // 카테고리 조회 (단일)
    static async get(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            
            if (isNaN(id)) {
                throw createError.validation('카테고리 ID');
            }

            const category = await CategoryService.get(id);
            
            res.status(200).json({
                success: true,
                data: category
            });

        } catch (error) {
            next(error)
        }
    }

    // 카테고리 목록 조회 (사용자별)
    static async getList(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = Number(req.user?.userId);

            const categories = await CategoryService.getList(userId);
            
            res.status(200).json({
                success: true,
                data: categories
            });

        } catch (error) {
            next(error)
        }
    }

    // 카테고리 목록 조회 (타입별)
    static async getListByType(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = Number(req.user?.userId);
            const type = parseInt(req.query.type as string);
            
            if (![0, 1].includes(type)) {
                throw createError.validation('type은 0(지출) 또는 1(수입)');
            }

            const categories = await CategoryService.getListByType(userId, type);
            
            res.status(200).json({
                success: true,
                data: categories
            });

        } catch (error) {
            next(error)
        }
    }

    // 계층형 카테고리 트리 조회
    static async getCategoryTree(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = parseInt(req.query.user_id as string);
            const type = parseInt(req.query.type as string);

            if (![0, 1].includes(type)) {
                throw createError.validation('type은 0(지출) 또는 1(수입)');
            }

            const categories = await CategoryService.getCategoryTree(userId, type);
            
            res.status(200).json({
                success: true,
                data: categories
            });

        } catch (error) {
            next(error)
        }
    }

    // 하위 카테고리 조회
    static async getChildren(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const parentId = parseInt(req.params.parentId);
            
            if (isNaN(parentId)) {
                throw createError.validation('유효하지 않은 부모 카테고리 ID');
            }

            const categories = await CategoryService.getChildren(parentId);
            
            res.status(200).json({
                success: true,
                data: categories
            });

        } catch (error) {
            next(error)
        }
    }

    // 카테고리 수정
    static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            const userId = Number(req.user?.userId);
            
            if (isNaN(id)) {
                throw createError.validation('카테고리 ID');
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
            next(error)
        }
    }

    // 카테고리 삭제
    static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            const userId = Number(req.user?.userId);
            
            if (isNaN(id)) {
                throw createError.validation('카테고리 ID');
            }

            const deletedCategory = await CategoryService.delete(id, userId);
            
            res.status(200).json({
                success: true,
                message: '카테고리가 성공적으로 삭제되었습니다.',
                data: deletedCategory
            });

        } catch (error) {
            next(error)
        }
    }
}