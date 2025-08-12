import { Request, Response, NextFunction } from 'express';
import { AssetService } from '../services/asset.service';
import { CreateDTO, UpdateDTO, Asset } from '../types/asset.type';
import { createError } from '../errors/app.error';

export class AssetController {
    static async create(req: Request<{}, Asset, CreateDTO>, res: Response, next: NextFunction) {
        try {
            const { name, type, balance, user_id } = req.body;
            
            // 필수 데이터 검증
            if (!name || !type || balance === undefined || !user_id) {
                throw createError.validation('name, type, balance, user_id');
            }

            // 데이터 타입 검증
            if (typeof balance !== 'number') {
                throw createError.validation('balance (숫자여야 함)');
            }

            const assetData: CreateDTO = req.body;
            const asset = await AssetService.create(assetData);
            res.status(201).json({
                success: true,
                data: asset
            });
        } catch (error) {
            next(error);
        }
    }

    static async get(req: Request<{ id: string }, Asset>, res: Response, next: NextFunction) {
        try {
            const id = Number(req.params.id);

            if (isNaN(id)) {
                throw createError.validation('자산 ID');
            }
            
            const asset = await AssetService.get(id);
            res.status(200).json({
                success: true,
                data: asset
            });
        } catch (error) {
            next(error);
        }
    }

    static async getList(req: Request<{}, Asset[]>, res: Response, next: NextFunction) {
        try {
            const userId = Number(req.user?.userId);
            
            const assets = await AssetService.getList(userId);
            res.status(200).json({
                success: true,
                data: assets
            });
        } catch (error) {
            next(error);
        }
    }

    static async update(req: Request<{ id: string }, Asset, Partial<UpdateDTO>>, res: Response, next: NextFunction) {
        try {
            const id = Number(req.params.id);
            const userId = Number(req.user?.userId);
            
            if (isNaN(id)) {
                throw createError.validation('자산 ID');
            }

            // 업데이트할 데이터가 있는지 검증
            const { name, type, balance } = req.body;
            if (name === undefined && type === undefined && balance === undefined) {
                throw createError.validation('수정할 데이터');
            }

            // 데이터 타입 검증
            if (balance !== undefined && (typeof balance !== 'number')) {
                throw createError.validation('balance (숫자여야 함)');
            }

            const updateData: UpdateDTO = { id, ...req.body };
            const asset = await AssetService.update(updateData, userId);
            res.status(200).json({
                success: true,
                data: asset
            });
        } catch (error) {
            next(error);
        }
    }

    static async delete(req: Request<{ id: string }, Asset>, res: Response, next: NextFunction) {
        try {
            const id = Number(req.params.id);
            const userId = Number(req.user?.userId);
            
            if (isNaN(id)) {
                throw createError.validation('자산 ID');
            }

            const deletedAsset = await AssetService.delete(id, userId);
            res.status(200).json({
                success: true,
                data: deletedAsset,
                message: '자산이 성공적으로 삭제되었습니다.'
            });
        } catch (error) {
            next(error);
        }
    }

    static async getTotalAssetValue(req: Request<{}, { totalValue: number }>, res: Response, next: NextFunction) {
        try {
            const userId = Number(req.user?.userId);
            
            const totalValue = await AssetService.getTotalAssetValue(userId);
            res.status(200).json({
                success: true,
                data: { totalValue }
            });
        } catch (error) {
            next(error);
        }
    }
}