import { useState, useEffect } from 'react';
import api from '../utils/api';
import type { Asset } from '../types/asset';

export const useAssets = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 자산 목록 가져오기
  const fetchAssets = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/asset');

      // 데이터 구조 확인
      let assetData;
      if (Array.isArray(response.data)) {
        assetData = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        assetData = response.data.data;
      } else if (response.data && response.data.assets && Array.isArray(response.data.assets)) {
        assetData = response.data.assets;
      } else {
        console.error('알 수 없는 데이터 구조:', response.data);
        setError('잘못된 데이터 형식입니다.');
        return;
      }
      
      console.log('추출된 자산 데이터:', assetData);
      setAssets(assetData);
      
    } catch (err: any) {
      console.error('자산 목록 에러:', err);
      const errorMessage = err.response?.data?.error || err.message || '자산 목록을 가져오는데 실패했습니다.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시 자동으로 데이터 가져오기
  useEffect(() => {
    fetchAssets();
  }, []);

  // 자산 추가
  const addAsset = async (assetData: { user_id: number; name: string; type: string; balance: number }) => {
    try {
      const response = await api.post('/asset', assetData);

      if (response.data?.success || response.status === 200 || response.status === 201) {
        return { success: true, message: '자산이 성공적으로 추가되었습니다!' };
      } else {
        throw new Error(response.data?.message || '자산 추가에 실패했습니다.');
      }
    } catch (error: any) {
      console.error('API 호출 오류:', error);
      const errorMessage = 
        error.response?.data?.message || 
        error.response?.data?.error || 
        error.message || 
        '자산 추가에 실패했습니다.';
      return { success: false, message: errorMessage };
    }
  };

  // 자산 타입 표시 함수
  const getAssetTypeDisplay = (type: string) => {
    const typeMap: Record<string, string> = {
      'account': '계좌',
      'card': '카드',
    };
    return typeMap[type] || '기타';
  };

  // 통화 포맷팅
  const formatCurrency = (amount: number) => {
    return `₩${amount.toLocaleString()}`;
  };

  return {
    assets,
    loading,
    error,
    fetchAssets,
    addAsset,
    getAssetTypeDisplay,
    formatCurrency
  };
};