import db from "../config/database";
import { Asset, CreateDTO, UpdateDTO } from "../types/asset.type";

export class AssetModel {
    static async create(assetData: CreateDTO): Promise<{changes: number, lastInsertRowid: number | bigint}> {
        const stmt = db.prepare(`
            INSERT INTO assets (name, type, balance, user_id)
            VALUES (@name, @type, @balance, @user_id)
        `);
        const result = stmt.run(assetData);
        return {changes: result.changes, lastInsertRowid: result.lastInsertRowid};
    }

    static async findById(id: number): Promise<Asset | undefined> {
        const stmt = db.prepare(`
            SELECT * 
            FROM assets 
            WHERE id = ?
        `);
        return stmt.get(id) as Asset | undefined;
    }

    static async findByUserId(userId: number): Promise<Asset[]> {
        const stmt = db.prepare(
            `SELECT * 
            FROM assets 
            WHERE user_id = ? 
            ORDER BY id DESC
        `);
        return stmt.all(userId) as Asset[];
    }

    static async update(assetData: UpdateDTO) : Promise<number> {
        const stmt = db.prepare(`
            UPDATE assets 
            SET name=@name, type=@type, balance=@balance 
            WHERE id=@id
        `);
        const result = stmt.run(assetData);
        return result.changes
    }

    static async delete(id: number): Promise<number> {
        const stmt = db.prepare(`
            DELETE FROM assets
            WHERE id = ? 
        `)
        const result = stmt.run(id);
        return result.changes;
    } 

    static async checkOwnership(assetId: number, userId: number): Promise<Boolean> {
        const stmt = db.prepare(`
            SELECT user_id
            FROM assets
            WHERE id = ?
        `);
        const asset = stmt.get(assetId) as {user_id: number} | undefined;
        return asset ? asset.user_id === userId : false
    }

    static async getTotalBalance(userId: number): Promise<number> {
        const stmt = db.prepare(`
            SELECT SUM(balance) AS total
            FROM assets
            WHERE user_id = ?
        `);
        const result = stmt.get(userId) as {total: number | null};
        console.log(result)
        return result.total || 0;
    }
}