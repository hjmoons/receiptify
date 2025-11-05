import { CategoryModel } from "../models/category.model";
import { Category, CreateDTO, UpdateDTO } from "../types/category.type";
import { createError } from "../errors/app.error";

export class CategoryService {
    static async create(categoryData: CreateDTO): Promise<Category> {
        // 1. 중복 검증 (같은 부모, 같은 타입에서 이름 중복 확인)
        await this.checkDuplicateName(categoryData.name, categoryData.user_id, categoryData.type, categoryData.parent_id);
        
       // 2. 카테고리 생성
        const result = await CategoryModel.create(categoryData);
        if (result.changes === 0) {
            throw createError.createFailed('카테고리');
        }

        // 3. 생성된 카테고리 반환
        const createdCategory = await CategoryModel.findById(Number(result.lastInsertRowid));
        if (!createdCategory) {
            throw createError.notFound('생성된 카테고리');
        }

        return createdCategory;
    }

    static async get(id: number): Promise<Category> {
        const category = await CategoryModel.findById(id) as Category;
        if (!category) {
            throw createError.notFound(`ID ${id}인 카테고리`);
        }

        return category;
    }

    static async getList(userId: number): Promise<Category[]> {
        const categories = await CategoryModel.findByUserId(userId);
        return categories;
    }

    // 타입별 카테고리 조회
    static async getListByType(userId: number, type: number): Promise<Category[]> {
        const categories = await CategoryModel.findByUserIdAndType(userId, type);
        return categories;
    }

    // 하위 카테고리 조회
    static async getChildren(parentId: number): Promise<Category[]> {
        const categories = await CategoryModel.findChildren(parentId);
        return categories;
    }
    
    static async update(categoryData: UpdateDTO, userId: number): Promise<Category> { 
        const categoryId = categoryData.id;
        // 1. 소유권 확인
        await this.verifyOwnership(categoryId, userId);

        // 2. 이름 변경 시 중복 검증
        if (categoryData.name) {
            const existingCategory = await CategoryModel.findById(categoryId);
            if (existingCategory && existingCategory.name !== categoryData.name) {
                await this.checkDuplicateName(
                    categoryData.name, 
                    userId, 
                    existingCategory.type, 
                    existingCategory.parent_id
                );
            }
        }

        // 3. 카테고리 업데이트 실행
        const result = await CategoryModel.update(categoryData);

        // 4. 업데이트가 실제로 실행되었는지 확인
        if (result === 0) {
            throw createError.updateFailed('카테고리');
        }

        const updatedCategory = await CategoryModel.findById(categoryId) as Category;
        return updatedCategory;
    }

    static async delete(id: number, userId: number): Promise<Category> {
        // 1. 소유권 확인
        const existingCategory = await this.verifyOwnership(id, userId);

        // 2. 하위 카테고리 존재 여부 확인
        const children = await CategoryModel.findChildren(id);
        if (children.length > 0) {
            throw createError.deleteFailed('하위 카테고리가 존재하는 카테고리');
        }

        // 3. 카테고리 삭제 실행
        const result = await CategoryModel.delete(id);
        if (result === 0) {
            throw createError.deleteFailed('카테고리');
        }

        return existingCategory;
    }

    // 중복 검증 (같은 부모, 같은 타입에서 이름 중복 확인)
    private static async checkDuplicateName(
        name: string, 
        userId: number, 
        type: number, 
        parentId: number | null
    ): Promise<void> {
        const existingCategories = await CategoryModel.findByUserIdAndType(userId, type);
        const duplicateCategory = existingCategories.find(category => 
            category.name.toLowerCase() === name.toLowerCase().trim() &&
            category.parent_id === parentId
        );
        
        if (duplicateCategory) {
            throw createError.duplicate('카테고리 이름');
        }
    }
    
    // 소유권 확인
    private static async verifyOwnership(categoryId: number, userId: number): Promise<Category> {
        const category = await CategoryModel.findById(categoryId);

        if (!category) {
            throw createError.notFound(`ID ${categoryId}인 카테고리`);
        }

        const hasOwnership = await CategoryModel.checkOwnership(categoryId, userId);
        if (!hasOwnership) {
            throw createError.permission(`ID ${categoryId} 카테고리`);
        }

        return category;
    }
}