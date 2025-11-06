import { Receipt, CreateDTO, UpdateDTO } from "../types/receipt.type";
import { ReceiptModel } from "../models/receipt.model";
import { createError } from "../errors/app.error";

export class ReceiptService {
    static async create(receiptData: CreateDTO): Promise<Receipt> {
        const result = await ReceiptModel.create(receiptData);
        if (result.changes === 0) {
            throw createError.createFailed('가계부 내역');
        }

        const createdReceipt = await ReceiptModel.findById(Number(result.lastInsertRowid));
        if (!createdReceipt) {
            throw createError.notFound('생성된 가계부 내역');
        }

        return createdReceipt;
    }

    static async get(id: number): Promise<Receipt> {
        const recipt = await ReceiptModel.findById(id) as Receipt;
        if (!recipt) {
            throw createError.notFound(`ID ${id}인 가계부 내역`);
        }
        return recipt;
    }

    static async getList(userId: number, year?: number, month?: number): Promise<Receipt[]> {
        if (year && month) {
            return await ReceiptModel.findByUserIdAndMonth(userId, year, month);
        }
        return await ReceiptModel.findByUserId(userId);
    }
    
    static async update(receiptData: UpdateDTO, userId: number): Promise<Receipt> {
        // 1. 소유권 확인
        await this.verifyOwnership(receiptData.id, userId);

        // 2. 자산 업데이트 실행
        const result = await ReceiptModel.update(receiptData);

        // 3. 업데이트가 실제로 실행되었는지 확인
        if (result === 0) {
            throw createError.updateFailed('가계부 내역');
        }

        return await ReceiptModel.findById(receiptData.id) as Receipt;
    }

    static async delete(id: number, userId: number): Promise<Receipt> {
        // 1. 소유권 확인
        const existingReceipt = await this.verifyOwnership(id, userId);

        // 2. 자산 삭제 실행
        const result = await ReceiptModel.delete(id);
        if (result === 0) {
            throw createError.deleteFailed('가계부 내역');
        }

        return existingReceipt;
    }

    static async getTotalExpendIncome(userId: number, year?: number, month?: number): Promise<{expend: number, income: number}> {
        const result = await ReceiptModel.getTotalExpendIncome(userId, year, month);

        // 결과가 아무것도 없을 경우
        if(!result) {
            throw createError.internal();
        }

        return result;
    }
    
    // 소유권 확인
    private static async verifyOwnership(receiptId: number, userId: number): Promise<Receipt> {
        const receipt = await ReceiptModel.findById(receiptId);
        
        if (!receipt) {
            throw createError.notFound(`ID ${receipt}인 가계부 내역`);
        }

        const hasOwnership = await ReceiptModel.checkOwnership(receiptId, userId);
        if (!hasOwnership) {
            throw createError.permission(`ID ${receiptId} 자산`);
        }

        return receipt;
    }
}