import React from 'react';
import type { Asset } from '../../types/asset';

interface AssetSelectModalProps {
  isOpen: boolean;
  assets: Asset[];
  selectedAssetId?: number;
  excludeAssetId?: number; // 이체 시 출금 자산 제외용
  onClose: () => void;
  onSelect: (assetId: number) => void;
}

export const AssetSelectModal: React.FC<AssetSelectModalProps> = ({
  isOpen,
  assets,
  selectedAssetId,
  excludeAssetId,
  onClose,
  onSelect
}) => {
  if (!isOpen) return null;

  const filteredAssets = excludeAssetId
    ? assets.filter(asset => asset.id !== excludeAssetId)
    : assets;

  const handleSelect = (assetId: number) => {
    onSelect(assetId);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">자산 선택</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <div className="space-y-2">
          {filteredAssets.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              등록된 자산이 없습니다.
            </div>
          ) : (
            filteredAssets.map(asset => (
              <button
                key={asset.id}
                onClick={() => handleSelect(asset.id)}
                className={`w-full text-left p-4 rounded-lg border transition-colors ${
                  selectedAssetId === asset.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">{asset.name}</div>
                    <div className="text-sm text-gray-500">
                      {asset.type === 'account' ? '계좌' : '카드'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-700">
                      ₩{asset.balance.toLocaleString()}
                    </div>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>

        <div className="mt-6">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
