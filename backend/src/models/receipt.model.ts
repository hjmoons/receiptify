import db from "../config/database";
import { Receipt, CreateDTO, UpdateDTO } from "../types/receipt.type";

export class ReceiptModel {
    static async create(receiptData: CreateDTO): Promise<{changes: number, lastInsertRowid: number | bigint}> {
        const transaction = db.transaction(() => {
            // 1. 거래 내역 추가
            const stmt = db.prepare(`
                INSERT INTO receipts (type, cost, content, location, transaction_date, user_id, asset_id, trs_asset_id, category_id)
                VALUES (@type, @cost, @content, @location, @transaction_date, @user_id, @asset_id, @trs_asset_id, @category_id)
            `);
            const result = stmt.run({
                ...receiptData,
                transaction_date: receiptData.transaction_date || new Date().toISOString()
            });
            
            // 2. 자산 잔액 업데이트
            if (receiptData.type === 0 || receiptData.type === 1) {
                // type: 0=지출, 1=수입
                const adjustAmount = receiptData.type === 1 ? receiptData.cost : -receiptData.cost;
                db.prepare(`UPDATE assets SET balance = balance + ? WHERE id = ?`)
                  .run(adjustAmount, receiptData.asset_id);
            } else if (receiptData.type === 2 && receiptData.trs_asset_id) {
                // 이체: 출금 계좌에서 빼고
                db.prepare(`UPDATE assets SET balance = balance - ? WHERE id = ?`)
                  .run(receiptData.cost, receiptData.asset_id);
                // 입금 계좌에 더하기
                db.prepare(`UPDATE assets SET balance = balance + ? WHERE id = ?`)
                  .run(receiptData.cost, receiptData.trs_asset_id);
            }
            
            return {changes: result.changes, lastInsertRowid: result.lastInsertRowid};
        });
        
        return transaction();
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
            ORDER BY transaction_date DESC, id DESC
        `);
        return stmt.all(userId) as Receipt[];
    }

    static async findByUserIdAndMonth(userId: number, year: number, month: number): Promise<Receipt[]> {
        const stmt = db.prepare(
            `SELECT *
            FROM receipts
            WHERE user_id = ?
            AND strftime('%Y', transaction_date) = ?
            AND strftime('%m', transaction_date) = ?
            ORDER BY transaction_date DESC, id DESC
        `);
        return stmt.all(userId, year.toString(), month.toString().padStart(2, '0')) as Receipt[];
    }

    static async update(receiptData: UpdateDTO) : Promise<number> {
        const transaction = db.transaction(() => {
            // 1. 기존 거래 정보 조회
            const oldReceipt = db.prepare(`
                SELECT type, cost, asset_id, trs_asset_id 
                FROM receipts 
                WHERE id = ?
            `).get(receiptData.id) as {type: number, cost: number, asset_id: number, trs_asset_id: number | null} | undefined;
            
            if (!oldReceipt) {
                throw new Error('거래를 찾을 수 없습니다');
            }
            
            // 2. 기존 거래 영향 복구
            if (oldReceipt.type === 0 || oldReceipt.type === 1) {
                const adjustAmount = oldReceipt.type === 0 ? oldReceipt.cost : -oldReceipt.cost;
                db.prepare(`UPDATE assets SET balance = balance + ? WHERE id = ?`)
                  .run(adjustAmount, oldReceipt.asset_id);
            } else if (oldReceipt.type === 2 && oldReceipt.trs_asset_id) {
                db.prepare(`UPDATE assets SET balance = balance + ? WHERE id = ?`)
                  .run(oldReceipt.cost, oldReceipt.asset_id);
                db.prepare(`UPDATE assets SET balance = balance - ? WHERE id = ?`)
                  .run(oldReceipt.cost, oldReceipt.trs_asset_id);
            }
            
            // 3. 거래 정보 업데이트
            const updateData: any = {
                id: receiptData.id,
                type: receiptData.type,
                cost: receiptData.cost,
                content: receiptData.content,
                location: receiptData.location,
                asset_id: receiptData.asset_id,
                trs_asset_id: receiptData.trs_asset_id,
                category_id: receiptData.category_id
            };

            let updateQuery = `
                UPDATE receipts
                SET type=@type, cost=@cost, content=@content, location=@location, asset_id=@asset_id, trs_asset_id=@trs_asset_id, category_id=@category_id`;

            if (receiptData.transaction_date) {
                updateQuery += `, transaction_date=@transaction_date`;
                updateData.transaction_date = receiptData.transaction_date;
            }

            updateQuery += ` WHERE id=@id`;

            const stmt = db.prepare(updateQuery);
            const result = stmt.run(updateData);
            
            // 4. 새로운 거래 영향 적용
            if (receiptData.type === 0 || receiptData.type === 1) {
                const adjustAmount = receiptData.type === 1 ? receiptData.cost : -receiptData.cost;
                db.prepare(`UPDATE assets SET balance = balance + ? WHERE id = ?`)
                  .run(adjustAmount, receiptData.asset_id);
            } else if (receiptData.type === 2 && receiptData.trs_asset_id) {
                db.prepare(`UPDATE assets SET balance = balance - ? WHERE id = ?`)
                  .run(receiptData.cost, receiptData.asset_id);
                db.prepare(`UPDATE assets SET balance = balance + ? WHERE id = ?`)
                  .run(receiptData.cost, receiptData.trs_asset_id);
            }
            
            return result.changes;
        });
        
        return transaction();
    }

    static async delete(id: number): Promise<number> {
        const transaction = db.transaction(() => {
            // 1. 삭제할 거래 정보 조회
            const receipt = db.prepare(`
                SELECT type, cost, asset_id, trs_asset_id 
                FROM receipts 
                WHERE id = ?
            `).get(id) as {type: number, cost: number, asset_id: number, trs_asset_id: number | null} | undefined;
            
            if (!receipt) {
                throw new Error('거래를 찾을 수 없습니다');
            }
            
            // 2. 자산 잔액 복구
            if (receipt.type === 0 || receipt.type === 1) {
                // 지출이면 다시 더하고, 수입이면 다시 빼기
                const adjustAmount = receipt.type === 0 ? receipt.cost : -receipt.cost;
                db.prepare(`UPDATE assets SET balance = balance + ? WHERE id = ?`)
                  .run(adjustAmount, receipt.asset_id);
            } else if (receipt.type === 2 && receipt.trs_asset_id) {
                // 이체 복구: 출금 계좌에 다시 더하고
                db.prepare(`UPDATE assets SET balance = balance + ? WHERE id = ?`)
                  .run(receipt.cost, receipt.asset_id);
                // 입금 계좌에서 다시 빼기
                db.prepare(`UPDATE assets SET balance = balance - ? WHERE id = ?`)
                  .run(receipt.cost, receipt.trs_asset_id);
            }
            
            // 3. 거래 삭제
            const stmt = db.prepare(`
                DELETE FROM receipts
                WHERE id = ? 
            `);
            const result = stmt.run(id);
            
            return result.changes;
        });
        
        return transaction();
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

    static async getTotalExpendIncome(userId: number, year?: number, month?: number): Promise<{expend: number, income: number} | undefined> {
        let query = `
            SELECT
                COALESCE(SUM(CASE WHEN type = 0 THEN cost END), 0) AS expend,
                COALESCE(SUM(CASE WHEN type = 1 THEN cost END), 0) AS income
            FROM receipts
            WHERE user_id = ?
            AND type IN (0, 1)`;

        const params: any[] = [userId];

        if (year && month) {
            query += ` AND strftime('%Y', transaction_date) = ? AND strftime('%m', transaction_date) = ?`;
            params.push(year.toString(), month.toString().padStart(2, '0'));
        } else {
            query += ` AND strftime('%Y-%m', transaction_date) = strftime('%Y-%m', 'now')`;
        }

        const stmt = db.prepare(query);
        return stmt.get(...params) as {expend: number, income: number} | undefined;
    }
}