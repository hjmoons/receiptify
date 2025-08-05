import db from "../config/database";
import { Category, CreateDTO, UpdateDTO } from "../types/category.type";

export class CategoryModel {
    static async create(categoryData: CreateDTO): Promise<{changes: number, lastInsertRowid: number | bigint}> {
        const stmt = db.prepare(`
            INSERT INTO categories (parent_id, name, type, level, user_id)
            VALUES (@parent_id, @name, @type, @level, @user_id)
        `);
        const result = stmt.run(categoryData);
        return {changes: result.changes, lastInsertRowid: result.lastInsertRowid};
    }

    static async findById(id: number): Promise<Category | undefined> {
        const stmt = db.prepare(`
            SELECT * 
            FROM categories 
            WHERE id = ?
        `);
        return stmt.get(id) as Category | undefined;
    }

    static async findByUserId(userId: number): Promise<Category[]> {
        const stmt = db.prepare(
            `SELECT * 
            FROM categories 
            WHERE user_id = ? 
            ORDER BY level ASC, id ASC
        `);
        return stmt.all(userId) as Category[];
    }

    static async update(categoryData: UpdateDTO): Promise<number> {
        const stmt = db.prepare(`
            UPDATE categories 
            SET parent_id=@parent_id, name=@name
            WHERE id=@id
        `);
        const result = stmt.run(categoryData);
        return result.changes;
    }

    static async delete(id: number): Promise<number> {
        const stmt = db.prepare(`
            DELETE FROM categories
            WHERE id = ? 
        `);
        const result = stmt.run(id);
        return result.changes;
    } 

    static async checkOwnership(categoryId: number, userId: number): Promise<boolean> {
        const stmt = db.prepare(`
            SELECT user_id
            FROM categories
            WHERE id = ?
        `);
        const category = stmt.get(categoryId) as {user_id: number} | undefined;
        return category ? category.user_id === userId : false;
    }

        // 수입/지출별 카테고리 조회
    static async findByUserIdAndType(userId: number, type: number): Promise<Category[]> {
        const stmt = db.prepare(`
            SELECT * 
            FROM categories 
            WHERE user_id = ? AND type = ?
            ORDER BY level ASC, id ASC
        `);
        return stmt.all(userId, type) as Category[];
    }

    // 하위 카테고리 조회
    static async findChildren(parentId: number): Promise<Category[]> {
        const stmt = db.prepare(`
            SELECT * 
            FROM categories 
            WHERE parent_id = ?
            ORDER BY id ASC
        `);
        return stmt.all(parentId) as Category[];
    }

    // 계층형 카테고리 트리 조회 (특정 사용자의 특정 타입)
    static async findCategoryTree(userId: number, type: number): Promise<Category[]> {
        const stmt = db.prepare(`
            SELECT * 
            FROM categories 
            WHERE user_id = ? AND type = ?
            ORDER BY level ASC, parent_id ASC, id ASC
        `);
        return stmt.all(userId, type) as Category[];
    }
}