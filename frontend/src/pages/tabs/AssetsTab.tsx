import { useEffect, useState } from 'react';
import api from '../../utils/api';
import { formatCurrency } from '../../utils/format';
import type { Asset, AssetStyle, AssetsTabProps, ApiResponse } from '../../types/asset';


export default function AssetsTab({ user }: AssetsTabProps) {
  // 자산 관련 상태
  const [assets, setAssets] = useState<Asset[]>([]);
  const [totalAssets, setTotalAssets] = useState<number>(0);
  const [assetsLoading, setAssetsLoading] = useState<boolean>(false);

  // 자산 목록 가져오기
  const fetchAssets = async (): Promise<void> => {
    if (!user.id) return;
    
    setAssetsLoading(true);
    try {
      const response = await api.get<ApiResponse<Asset[]>>(`/asset`);
      // 응답 형식에 따라 처리
      if (response.data?.success && response.data.data) {
        setAssets(response.data.data);
      } else if (Array.isArray(response.data)) {
        // 기존 형식 대응 (배열이 바로 오는 경우)
        setAssets(response.data);
      } else {
        setAssets([]);
      }
    } catch (error) {
      if (import.meta.env.DEV) console.error('자산 목록 조회 오류:', error);
      setAssets([]);
    } finally {
      setAssetsLoading(false);
    }
  };

  // 총 자산 가져오기
  const fetchTotalAssets = async (): Promise<void> => {
    if (!user.id) return;
    
    try {
      const response = await api.get<ApiResponse<{ totalValue: number }>>(`/asset/total`);
      // 응답 형식에 따라 처리
      if (response.data?.success && response.data.data) {
        setTotalAssets(response.data.data.totalValue || 0);
      } else if (response.data && 'totalValue' in response.data) {
        // 기존 형식 대응
        setTotalAssets((response.data as any).totalValue || 0);
      } else {
        setTotalAssets(0);
      }
    } catch (error) {
      if (import.meta.env.DEV) console.error('총 자산 조회 오류:', error);
      setTotalAssets(0);
    }
  };

  // 컴포넌트 마운트 시 자산 데이터 가져오기
  useEffect(() => {
    if (user.id) {
      fetchAssets();
      fetchTotalAssets();
    }
  }, [user.id]);

  // 자산 유형별 아이콘 및 색상
  const getAssetStyle = (type: Asset['type']): AssetStyle => {
    switch (type) {
      case 'account':
        return {
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-800',
          badgeColor: 'bg-blue-200 text-blue-800',
          label: '계좌'
        };
      case 'card':
        return {
          bgColor: 'bg-purple-50',
          borderColor: 'border-purple-200',
          textColor: 'text-purple-800',
          badgeColor: 'bg-purple-200 text-purple-800',
          label: '카드'
        };
      default:
        return {
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          textColor: 'text-gray-800',
          badgeColor: 'bg-gray-200 text-gray-800',
          label: '기타'
        };
    }
  };


  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">자산 목록</h3>
        </div>

        {/* 총 자산 요약 */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 rounded-lg text-white">
          <h4 className="text-lg font-medium opacity-90">총 자산</h4>
          <p className="text-3xl font-bold mt-2">{formatCurrency(totalAssets)}</p>
          <p className="text-sm opacity-75 mt-1">등록된 자산: {assets.length}개</p>
        </div>

        {/* 자산 목록 */}
        {assetsLoading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">자산 목록을 불러오는 중...</p>
          </div>
        ) : assets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assets.map((asset: Asset) => {
              const style = getAssetStyle(asset.type);
              return (
                <div key={asset.id} className={`${style.bgColor} p-4 rounded-lg border ${style.borderColor} relative group`}>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className={`font-semibold ${style.textColor} truncate pr-2`} title={asset.name}>
                      {asset.name}
                    </h4>
                    <span className={`text-xs px-2 py-1 rounded ${style.badgeColor} whitespace-nowrap`}>
                      {style.label}
                    </span>
                  </div>
                  <p className={`text-2xl font-bold ${style.textColor} mb-2`}>
                    {formatCurrency(asset.balance)}
                  </p>
                  {asset.created_at && (
                    <p className="text-xs text-gray-500">
                      등록일: {new Date(asset.created_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-gray-50 p-8 rounded-lg text-center">
            <div className="text-gray-400 text-4xl mb-4">💳</div>
            <p className="text-gray-600 mb-2">등록된 자산이 없습니다.</p>
            <p className="text-gray-500 text-sm mb-4">계좌나 카드를 추가해보세요.</p>
          </div>
        )}

        {/* 예산 설정 */}
        <div className="bg-white border rounded-lg p-6">
          <h4 className="font-semibold mb-4">예산 설정</h4>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-gray-700">월 예산</label>
              <input 
                type="number" 
                placeholder="0" 
                className="border rounded px-3 py-2 w-32 text-right"
              />
            </div>
            <div className="flex justify-between items-center">
              <label className="text-gray-700">저축 목표</label>
              <input 
                type="number" 
                placeholder="0" 
                className="border rounded px-3 py-2 w-32 text-right"
              />
            </div>
            <button className="w-full mt-4 px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900">
              설정 저장
            </button>
          </div>
        </div>
      </div>
    </>
  );
}