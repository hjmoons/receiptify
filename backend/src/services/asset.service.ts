import { Asset, CreateDTO, UpdateDTO } from "../types/asset.type";
import { AssetModel } from "../models/asset.model";
import { createError } from "../errors/app.error";

export class AssetService {
    static async create(assetData: CreateDTO): Promise<Asset> {
        // 1. 중복 검증 (같은 사용자가 같은 이름의 자산을 가지고 있는지)
        await this.checkDuplicateName(assetData.name, assetData.user_id);
        
       // 2. 자산 생성
        const result = await AssetModel.create(assetData);
        if (result.changes === 0) {
            throw createError.createFailed('자산');
        }

        // 3. 생성된 자산 반환
        const createdAsset = await AssetModel.findById(Number(result.lastInsertRowid));
        if (!createdAsset) {
            throw createError.notFound('생성된 자산');
        }

        console.log("Created Asset Value: ", createdAsset);

        return createdAsset;
    }

    static async get(id: number): Promise<Asset> {
        const asset = await AssetModel.findById(id) as Asset;
        if (!asset) {
            throw createError.notFound(`ID ${id}인 자산`);
        }
        return asset
    }

    static async getList(userId: number): Promise<Asset[]> {
        return await AssetModel.findByUserId(userId);
    }
    
    static async update(assetData: UpdateDTO, userId: number): Promise<Asset> {
        // 1. 소유권 확인
        await this.verifyOwnership(assetData.id, userId);

        // 2. 자산 업데이트 실행
        const result = await AssetModel.update(assetData);

        // 3. 업데이트가 실제로 실행되었는지 확인
        if (result === 0) {
            throw createError.updateFailed('자산');
        }

        return await AssetModel.findById(assetData.id) as Asset;
    }

    static async delete(id: number, userId: number): Promise<Asset> {
        // 1. 소유권 확인
        const existingAsset = await this.verifyOwnership(id, userId);

        // 2. 자산 삭제 실행
        const result = await AssetModel.delete(id);
        if (result === 0) {
            throw createError.deleteFailed('자산');
        }

        return existingAsset;
    }

    static async getTotalAssetValue(userId: number): Promise<number> {
        const result = await AssetModel.getTotalBalance(userId);
        console.log('Total Asset Value: ', result);
        return result;
    }

    // 중복 검증
    private static async checkDuplicateName(name: string, userId: number): Promise<void> {
        const existingAssets = await AssetModel.findByUserId(userId);
        const duplicateAsset = existingAssets.find(asset => 
            asset.name.toLowerCase() === name.toLowerCase().trim()
        );
        
        if (duplicateAsset) {
            throw createError.duplicate('자산 이름');
        }
    }
    
    // 소유권 확인
    private static async verifyOwnership(assetId: number, userId: number): Promise<Asset> {
        const asset = await AssetModel.findById(assetId);
        
        if (!asset) {
            throw createError.notFound(`ID ${assetId}인 자산`);
        }

        const hasOwnership = await AssetModel.checkOwnership(assetId, userId);
        if (!hasOwnership) {
            throw createError.permission(`ID ${assetId} 자산`);
        }

        return asset;
    }
}