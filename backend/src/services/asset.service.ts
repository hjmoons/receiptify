import { Asset, CreateDTO, UpdateDTO } from "../types/asset.type";
import { AssetModel } from "../models/asset.model";
import {
    DuplicateAssetError,
    AssetCreateError,
    AssetUpdateError,
    AssetDeleteError,
} from "../errors/asset.error";
import {
    NotFoundError,
    PermissionError
} from "../errors/common.error"

export class AssetService {
    static async create(assetData: CreateDTO): Promise<Asset> {
        // 1. 중복 검증 (같은 사용자가 같은 이름의 자산을 가지고 있는지)
        await this.checkDuplicateName(assetData.name, assetData.user_id);
        
       // 2. 자산 생성
        const result = await AssetModel.create(assetData);
        if (result.changes === 0) {
            throw new AssetCreateError('자산 생성에 실패했습니다.');
        }

        // 3. 생성된 자산 반환
        const createdAsset = await AssetModel.findById(Number(result.lastInsertRowid));
        if (!createdAsset) {
            throw new NotFoundError('생성된 자산을 찾을 수 없습니다.');
        }

        return createdAsset;
    }

    static async get(id: number): Promise<Asset> {
        const asset = await AssetModel.findById(id) as Asset;
        if (!asset) {
            throw new NotFoundError(`ID ${id}인 자산을 찾을 수 없습니다.`);
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
            throw new AssetUpdateError('자산 업데이트에 실패했습니다.');
        }

        return await AssetModel.findById(assetData.id) as Asset;
    }

    static async delete(id: number, userId: number): Promise<Asset> {
        // 1. 소유권 확인
        const existingAsset = await this.verifyOwnership(id, userId);

        // 2. 자산 삭제 실행
        const result = await AssetModel.delete(id);
        if (result === 0) {
            throw new AssetDeleteError('자산 삭제에 실패했습니다.');
        }

        return existingAsset;
    }

    static async getTotalAssetValue(userId: number): Promise<number> {
        return await AssetModel.getTotalBalance(userId);
    }

    // 중복 검증
    private static async checkDuplicateName(name: string, userId: number): Promise<void> {
        const existingAssets = await AssetModel.findByUserId(userId);
        const duplicateAsset = existingAssets.find(asset => 
            asset.name.toLowerCase() === name.toLowerCase().trim()
        );
        
        if (duplicateAsset) {
            throw new DuplicateAssetError('이미 같은 이름의 자산이 존재합니다.');
        }
    }
    
    // 소유권 확인
    private static async verifyOwnership(assetId: number, userId: number): Promise<Asset> {
        const asset = await AssetModel.findById(assetId);
        
        if (!asset) {
            throw new NotFoundError(`ID ${assetId}인 자산을 찾을 수 없습니다.`);
        }

        const hasOwnership = await AssetModel.checkOwnership(assetId, userId);
        if (!hasOwnership) {
            throw new PermissionError(`ID ${assetId} 자산에 대한 권한이 없습니다.`);
        }

        return asset;
    }
}