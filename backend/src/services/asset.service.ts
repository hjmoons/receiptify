import { Asset, CreateDTO, UpdateDTO } from "../types/asset.type";
import { AssetModel } from "../models/asset.model";

export class AssetService {
    static async create(assetData: CreateDTO): Promise<Asset> {
        // 1. 중복 검증 (같은 사용자가 같은 이름의 자산을 가지고 있는지)
       const existingAssets = await AssetModel.findByUserId(assetData.user_id);
       const duplicateAsset = existingAssets.find(asset => 
           asset.name.toLowerCase() === assetData.name.toLowerCase().trim()
       );
       
       if (duplicateAsset) {
           throw new Error('이미 같은 이름의 자산이 존재합니다.');
       }
       
       // 2. 자산 생성
       const result = await AssetModel.create(assetData);
       
       if (result.changes === 0) {
           throw new Error('자산 생성에 실패했습니다.');
       }
       
       // 3. 생성된 자산 반환
       const createdAsset = await AssetModel.findById(Number(result.lastInsertRowid));
       
       if (!createdAsset) {
           throw new Error('생성된 자산을 찾을 수 없습니다.');
       }
       
       return createdAsset;
    }

    static async update(assetData: UpdateDTO, userId: number): Promise<Asset> {
        // 1. 자산 ID 존재 확인
        const existingAsset = await AssetModel.findById(assetData.id);
        if(!existingAsset) {
            throw new Error(`ID ${assetData.id}인 자산을 찾을 수 없습니다.`);
        } 

        // 2. 자산이 사용자 소유의 자산인지 확인
        const check = await AssetModel.checkOwnership(assetData.id, userId);
        if(!check) {
            throw new Error(`ID ${assetData.id} 자산을 수정할 권한이 없습니다.`);
        }

        // 3. 자산 업데이트 실행
        const result = await AssetModel.update(assetData);

        // 4. 업데이트가 실제로 실행되었는지 확인
        if (result === 0) {
            throw new Error('자산 업데이트에 실패했습니다.');
        }

        return await AssetModel.findById(assetData.id) as Asset;
    }

    static async delete(id: number, userId: number): Promise<Asset> {
        // 1. Asset ID 존재 확인
        const existingAsset = await AssetModel.findById(id);
        if(!existingAsset) {
            throw new Error(`ID ${id}인 자산을 찾을 수 없습니다.`);
        }

        // 2. 자산이 사용자 소유의 자산인지 확인
        const check = await AssetModel.checkOwnership(id, userId);
        if(!check) {
            throw new Error(`ID ${id} 자산을 수정할 권한이 없습니다.`);
        }

        // 3. 자산 삭제 실행
        const result = await AssetModel.delete(id);
        if (result === 0) {
            throw new Error('자산 삭제에 실패했습니다.');
        }

        return existingAsset;
    }
}