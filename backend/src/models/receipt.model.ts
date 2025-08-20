import db from "../config/database";
import { Receipt, CreateDTO, UpdateDTO } from "../types/receipt.type";

export class ReceiptModel {
    static async create(receiptData: CreateDTO): Promise<{changes: number, lastInsertRowid: number | bigint}> {
        const stmt = db.prepare(`
            INSERT INTO receipts (type, cost, content, location, user_id, asset_id, trs_asset_id, category_id)
            VALUES (@type, @cost, @content, @location, @user_id, @asset_id, @trs_asset_id, @category_id)
        `);
        const result = stmt.run(receiptData);
        return {changes: result.changes, lastInsertRowid: result.lastInsertRowid};
    }

    static async findById(id: number): Promise<Receipt | undefined> {
        const stmt = db.prepare(`
            SELECT * 
            FROM receipts 
            WHERE id = ?
        `);
        return stmt.get(id) as Receipt | undefined;
    }

    static async findByUserId(userId: number): Promise<Receipt[]> {
        const stmt = db.prepare(
            `SELECT * 
            FROM receipts 
            WHERE user_id = ? 
            ORDER BY created_at DESC, id DESC
        `);
        return stmt.all(userId) as Receipt[];
    }

    static async update(receiptData: UpdateDTO) : Promise<number> {
        const stmt = db.prepare(`
            UPDATE receipts 
            SET type=@type, cost=@cost, content=@content, location=@location, asset_id=@asset_id, trs_asset_id=@trs_asset_id, category_id=@category_id
            WHERE id=@id
        `);
        const result = stmt.run(receiptData);
        return result.changes
    }

    static async delete(id: number): Promise<number> {
        const stmt = db.prepare(`
            DELETE FROM receipts
            WHERE id = ? 
        `)
        const result = stmt.run(id);
        return result.changes;
    } 

    static async checkOwnership(receiptId: number, userId: number): Promise<boolean> {
        const stmt = db.prepare(`
            SELECT user_id
            FROM receipts
            WHERE id = ?
        `);
        const receipt = stmt.get(receiptId) as {user_id: number} | undefined;
        return receipt ? receipt.user_id === userId : false
    }

    static async getTotalExpendIncome(userId: number): Promise<{expend: number, income: number} | undefined> {
        const stmt = db.prepare(`
            SELECT 
                COALESCE(SUM(CASE WHEN type = 0 THEN cost END), 0) AS expend,
                COALESCE(SUM(CASE WHEN type = 1 THEN cost END), 0) AS income
            FROM receipts 
            WHERE user_id = ? 
            AND type IN (0, 1)
            AND strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now')  
        `);
        return stmt.get(userId) as {expend: number, income: number} | undefined;
    }
}