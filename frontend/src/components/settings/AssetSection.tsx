import React, { useState, useEffect } from 'react';
import { useAssets } from '../../hooks/UseAssets';
import { useKebabMenu } from '../../hooks/UseKebabMenu';
import { AssetModal } from '../common/AssetModal';
import type { Asset } from '../../types/asset';

interface User {
  id: number;
}

interface AssetSectionProps {
  user: User;
  loading: boolean;
}

// 자산용 케밥 메뉴 컴포넌트
const AssetKebabMenu: React.FC<{
  asset: Asset;
  isOpen: boolean;
  menuRef?: React.RefObject<HTMLDivElement | null>;
  onToggle: (assetId: number, event: React.MouseEvent) => void;
  onEdit: (asset: Asset) => void;
  onDelete: (asset: Asset) => void;
}> = ({ asset, isOpen, menuRef, onToggle, onEdit, onDelete }) => {
  return (
    <div className="relative" ref={isOpen ? menuRef : null}>
      <button
        onClick={(e) => onToggle(asset.id, e)}
        className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
        title="옵션"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
        </svg>
      </button>
      
      {isOpen && (
        <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-28">
          <button
            onClick={() => onEdit(asset)}
            className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2 rounded-t-lg"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span>수정</span>
          </button>
          <button
            onClick={() => onDelete(asset)}
            className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2 rounded-b-lg"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span>삭제</span>
          </button>
        </div>
      )}
    </div>
  );
};

export const AssetSection: React.FC<AssetSectionProps> = ({ user, loading }) => {
  const { assets, formatCurrency, getAssetTypeDisplay, fetchAssets } = useAssets();
  const { openMenuId, menuRef, toggleKebabMenu, closeMenu } = useKebabMenu();
  const [showAssetModal, setShowAssetModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);

  // 섹션이 열릴 때 데이터 새로고침
  useEffect(() => {
    fetchAssets();
  }, []);

  const handleAddAsset = () => {
    setEditingAsset(null);
    setShowAssetModal(true);
  };

  const handleEditAsset = (asset: Asset) => {
    setEditingAsset(asset);
    setShowAssetModal(true);
    closeMenu();
  };

  const handleDeleteAsset = async (asset: Asset) => {
    if (!confirm(`'${asset.name}' 자산을 삭제하시겠습니까?`)) {
      return;
    }

    closeMenu();

    try {
      // API 호출
      const api = (await import('../../utils/api')).default;
      const response = await api.delete(`/asset/${asset.id}`);
      
      if (response.data?.success || response.status === 200 || response.status === 204) {
        alert('자산이 삭제되었습니다.');
        fetchAssets(); // 목록 새로고침
      } else {
        throw new Error(response.data?.message || '자산 삭제에 실패했습니다.');
      }
    } catch (error: any) {
      console.error('자산 삭제 오류:', error);
      const errorMessage = 
        error.response?.data?.message || 
        error.response?.data?.error || 
        '자산 삭제에 실패했습니다.';
      alert(errorMessage);
    }
  };

  const handleCloseModal = () => {
    setShowAssetModal(false);
    setEditingAsset(null);
  };

  const handleSuccess = () => {
    // 자산 추가/수정 성공 후 목록 새로고침
    fetchAssets();
  };

  return (
    <div className="pt-4">
      <h4 className="text-sm font-medium text-gray-500 mb-3">자산 목록</h4>
      
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="space-y-2">
          {assets.length > 0 ? (
            <div>
              {assets.map((asset) => (
                <div
                  key={asset.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      (asset.balance || 0) >= 0 ? 'bg-blue-500' : 'bg-red-500'
                    }`}></div>
                    <div>
                      <div className="font-medium text-gray-800">{asset.name || 'Unknown'}</div>
                      <div className="text-sm text-gray-500">{getAssetTypeDisplay(asset.type || '')}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <div className={`font-semibold ${
                        (asset.balance || 0) >= 0 ? 'text-gray-800' : 'text-red-600'
                      }`}>
                        {formatCurrency(asset.balance || 0)}
                      </div>
                    </div>
                    
                    {/* 케밥 메뉴 */}
                    <AssetKebabMenu
                      asset={asset}
                      isOpen={openMenuId === asset.id}
                      menuRef={openMenuId === asset.id ? menuRef : undefined}
                      onToggle={toggleKebabMenu}
                      onEdit={handleEditAsset}
                      onDelete={handleDeleteAsset}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              등록된 자산이 없습니다. (현재 {assets.length}개)
            </div>
          )}
          
          {/* 디버깅용 - 나중에 제거 */}
          <div className="text-xs text-gray-400 mt-2">
            총 {assets.length}개 자산
          </div>
        </div>
      )}
      
      {/* 자산 추가 버튼 */}
      <button
        onClick={handleAddAsset}
        className="w-full mt-4 py-3 border-2 border-dashed border-gray-300 text-gray-500 hover:border-blue-400 hover:text-blue-600 rounded-lg transition-colors flex items-center justify-center space-x-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        <span className="font-medium">자산 추가</span>
      </button>

      {/* 자산 추가/수정 모달 */}
      <AssetModal
        isOpen={showAssetModal}
        user={user}
        editingAsset={editingAsset}
        onClose={handleCloseModal}
        onSuccess={handleSuccess}
      />
    </div>
  );
};