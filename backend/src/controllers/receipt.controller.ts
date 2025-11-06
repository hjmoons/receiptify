import { Request, Response, NextFunction } from 'express';
import { ReceiptService } from '../services/receipt.service';
import { CreateDTO, UpdateDTO, Receipt } from '../types/receipt.type';
import { createError } from '../errors/app.error';

export class ReceiptController {
    static async create(req: Request<{}, Receipt, CreateDTO>, res: Response, next: NextFunction) {
        try {
            const { type, cost, content, user_id, asset_id } = req.body;

            // 필수 데이터 검증
            if (type === undefined || cost === undefined || !content || !user_id || !asset_id) {
                throw createError.validation('type, cost, content, user_id, asset_id');
            }

            // 데이터 타입 검증
            if (typeof cost !== 'number') {
                throw createError.validation('cost (숫자여야 함)');
            }

            // type 검증 (0: 지출, 1: 수입, 2: 이체)
            if (![0, 1, 2].includes(type)) {
                throw createError.validation('type (0: 지출, 1: 수입, 2: 이체)');
            }

            const receiptData: CreateDTO = req.body;
            const receipt = await ReceiptService.create(receiptData);
            res.status(201).json({
                success: true,
                data: receipt
            });
        } catch (error) {
            next(error);
        }
    }

    static async get(req: Request<{ id: string }, Receipt>, res: Response, next: NextFunction) {
        try {
            const id = Number(req.params.id);

            if (isNaN(id)) {
                throw createError.validation('가계부 내역 ID');
            }

            const receipt = await ReceiptService.get(id);
            res.status(200).json({
                success: true,
                data: receipt
            });
        } catch (error) {
            next(error);
        }
    }

    static async getList(req: Request<{}, Receipt[]>, res: Response, next: NextFunction) {
        try {
            const userId = Number(req.user?.userId);
            const year = req.query.year ? Number(req.query.year) : undefined;
            const month = req.query.month ? Number(req.query.month) : undefined;

            const receipts = await ReceiptService.getList(userId, year, month);
            res.status(200).json({
                success: true,
                data: receipts
            });
        } catch (error) {
            next(error);
        }
    }

    static async update(req: Request<{ id: string }, Receipt, UpdateDTO>, res: Response, next: NextFunction) {
        try {
            const id = Number(req.params.id);
            const userId = Number(req.user?.userId);

            if (isNaN(id)) {
                throw createError.validation('가계부 내역 ID');
            }

            const { type, cost, content, asset_id } = req.body;

            // 필수 데이터 검증
            if (type === undefined || cost === undefined || !content || !asset_id) {
                throw createError.validation('type, cost, content, asset_id');
            }

            // type 검증
            if (![0, 1, 2].includes(type)) {
                throw createError.validation('type (0: 지출, 1: 수입, 2: 이체)');
            }

            const receiptData: UpdateDTO = { ...req.body, id };
            const receipt = await ReceiptService.update(receiptData, userId);
            res.status(200).json({
                success: true,
                data: receipt,
                message: '가계부 내역이 수정되었습니다.'
            });
        } catch (error) {
            next(error);
        }
    }

    static async delete(req: Request<{ id: string }, Receipt>, res: Response, next: NextFunction) {
        try {
            const id = Number(req.params.id);
            const userId = Number(req.user?.userId);

            if (isNaN(id)) {
                throw createError.validation('가계부 내역 ID');
            }

            const receipt = await ReceiptService.delete(id, userId);
            res.status(200).json({
                success: true,
                data: receipt,
                message: '가계부 내역이 삭제되었습니다.'
            });
        } catch (error) {
            next(error);
        }
    }

    // 총 수입/지출 조회
    static async getTotalExpendIncome(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = Number(req.user?.userId);
            const year = req.query.year ? Number(req.query.year) : undefined;
            const month = req.query.month ? Number(req.query.month) : undefined;

            const totals = await ReceiptService.getTotalExpendIncome(userId, year, month);
            res.status(200).json({
                success: true,
                data: totals
            });
        } catch (error) {
            next(error);
        }
    }
}
