import { Request, Response } from 'express';
import { AssetService } from '../services/asset.service';
import { CreateDTO, UpdateDTO, Asset } from '../types/asset.type';

export class AssetController {
    static async create(req: Request<{}, Asset, CreateDTO>, res: Response) {
        try {
            const { name, type, balance, user_id } = req.body;
            
            // 필수 데이터 검증
            if (!name || !type || balance === undefined || !user_id) {
                return res.status(400).json({ 
                    error: '필수 데이터가 누락되었습니다. (name, type, balance, user_id 필요)' 
                });
            }

            // 데이터 타입 검증
            if (typeof balance !== 'number') {
                return res.status(400).json({ error: '잔액은 숫자만 입력해야합니다.' });
            }

            const assetData: CreateDTO = req.body;
            const asset = await AssetService.create(assetData);
            res.status(201).json(asset);
        } catch (error) {
            res.status(400).json({ 
                error: error instanceof Error ? error.message : '자산 생성 중 오류가 발생했습니다.' 
            });
        }
    }

    static async get(req: Request<{ id: string }, Asset>, res: Response) {
        try {
            const id = Number(req.params.id);
            if (isNaN(id)) {
                return res.status(400).json({ error: '유효하지 않은 자산 ID입니다.' });
            }
            
            const asset = await AssetService.get(id);
            res.json(asset);
        } catch (error) {
            const statusCode = error instanceof Error && error.message.includes('찾을 수 없습니다') ? 404 : 500;
            res.status(statusCode).json({ 
                error: error instanceof Error ? error.message : '자산 조회 중 오류가 발생했습니다.' 
            });
        }
    }

    static async getList(req: Request<{}, Asset[]>, res: Response) {
        try {
            const userId = Number(req.user?.userId);
            if (isNaN(userId) || !req.user) {
                return res.status(401).json({ error: '인증이 필요합니다.' });
            }
            
            const assets = await AssetService.getList(userId);
            res.json(assets);
        } catch (error) {
            res.status(500).json({ 
                error: error instanceof Error ? error.message : '자산 목록 조회 중 오류가 발생했습니다.' 
            });
        }
    }

    static async update(req: Request<{ id: string }, Asset, Partial<UpdateDTO>>, res: Response) {
        try {
            const id = Number(req.params.id);
            const userId = Number(req.user?.userId);
            
            if (isNaN(id)) {
                return res.status(400).json({ error: '유효하지 않은 자산 ID입니다.' });
            }
            if (isNaN(userId) || !req.user) {
                return res.status(401).json({ error: '인증이 필요합니다.' });
            }

            // 업데이트할 데이터가 있는지 검증
            const { name, type, balance } = req.body;
            if (name === undefined && type === undefined && balance === undefined) {
                return res.status(400).json({ error: '수정할 데이터가 없습니다.' });
            }

            // 데이터 타입 검증
            if (balance !== undefined && (typeof balance !== 'number' || balance < 0)) {
                return res.status(400).json({ error: '잔액은 0 이상의 숫자여야 합니다.' });
            }

            const updateData: UpdateDTO = { id, ...req.body };
            const asset = await AssetService.update(updateData, userId);
            res.json(asset);
        } catch (error) {
            let statusCode = 500;
            if (error instanceof Error) {
                if (error.message.includes('찾을 수 없습니다')) statusCode = 404;
                else if (error.message.includes('권한이 없습니다')) statusCode = 403;
                else if (error.message.includes('업데이트에 실패')) statusCode = 400;
            }
            
            res.status(statusCode).json({ 
                error: error instanceof Error ? error.message : '자산 수정 중 오류가 발생했습니다.' 
            });
        }
    }

    static async delete(req: Request<{ id: string }, Asset>, res: Response) {
        try {
            const id = Number(req.params.id);
            const userId = Number(req.user?.userId);
            
            if (isNaN(id)) {
                return res.status(400).json({ error: '유효하지 않은 자산 ID입니다.' });
            }
            if (isNaN(userId) || !req.user) {
                return res.status(401).json({ error: '인증이 필요합니다.' });
            }

            const deletedAsset = await AssetService.delete(id, userId);
            res.json(deletedAsset);
        } catch (error) {
            let statusCode = 500;
            if (error instanceof Error) {
                if (error.message.includes('찾을 수 없습니다')) statusCode = 404;
                else if (error.message.includes('권한이 없습니다')) statusCode = 403;
                else if (error.message.includes('삭제에 실패')) statusCode = 400;
            }
            
            res.status(statusCode).json({ 
                error: error instanceof Error ? error.message : '자산 삭제 중 오류가 발생했습니다.' 
            });
        }
    }

    static async getTotalAssetValue(req: Request<{}, { totalValue: number }>, res: Response) {
        try {
            const userId = Number(req.user?.userId);
            if (isNaN(userId) || !req.user) {
                return res.status(401).json({ error: '인증이 필요합니다.' });
            }
            
            const totalValue = await AssetService.getTotalAssetValue(userId);
            res.json({ totalValue });
        } catch (error) {
            res.status(500).json({ 
                error: error instanceof Error ? error.message : '총 자산 조회 중 오류가 발생했습니다.' 
            });
        }
    }
}