import { useEffect, useState } from 'react';
import api from '../../utils/api';
import type { Asset, AssetForm, AssetStyle } from '../../types/asset';

interface AssetsTabProps {
  user: {
    id: string;
    name: string;
  };
}

// API 응답 타입 정의
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  code?: string;
}

export default function AssetsTab({ user }: AssetsTabProps) {
  // 자산 관련 상태
  const [assets, setAssets] = useState<Asset[]>([]);
  const [totalAssets, setTotalAssets] = useState<number>(0);
  const [assetsLoading, setAssetsLoading] = useState<boolean>(false);

  // 자산 추가 팝업 설정
  const [showAccountModal, setShowAccountModal] = useState<boolean>(false);
  const [accountForm, setAccountForm] = useState<AssetForm>({
    name: '',
    type: 'account',
    balance: 0
  });
  const [loading, setLoading] = useState<boolean>(false);

  // 자산 목록 가져오기
  const fetchAssets = async (): Promise<void> => {
    if (!user.id) return;
    
    setAssetsLoading(true);
    try {
      const response = await api.get<ApiResponse<Asset[]>>(`/asset?user_id=${user.id}`);
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
      console.error('자산 목록 조회 오류:', error);
      setAssets([]);
    } finally {
      setAssetsLoading(false);
    }
  };

  // 총 자산 가져오기
  const fetchTotalAssets = async (): Promise<void> => {
    if (!user.id) return;
    
    try {
      const response = await api.get<ApiResponse<{ totalValue: number }>>(`/asset/total?user_id=${user.id}`);
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
      console.error('총 자산 조회 오류:', error);
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

  // 자산 추가 모달 열기
  const openAccountModal = (): void => {
    setShowAccountModal(true);
    setAccountForm({
      name: '',
      type: 'account',
      balance: 0
    });
  };

  // 자산 추가 모달 닫기
  const closeAccountModal = (): void => {
    setShowAccountModal(false);
    setAccountForm({
      name: '',
      type: 'account',
      balance: 0
    });
  };

  // 폼 입력 처리
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value } = e.target;
    setAccountForm(prev => ({
      ...prev,
      [name]: name === 'balance' ? parseInt(value) || 0 : value
    }));
  };

   // 자산 추가 API 호출
  const handleAddAccount = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    
    if (!accountForm.name.trim()) {
      alert('자산명을 입력해주세요.');
      return;
    }

    setLoading(true);
    
    try {
      const response = await api.post<ApiResponse<Asset>>('/asset', {
        user_id: user.id,
        name: accountForm.name,
        type: accountForm.type,
        balance: accountForm.balance
      });

      // 응답 확인
      if (response.data?.success) {
        alert('자산이 성공적으로 추가되었습니다!');
        closeAccountModal();
        // 자산 목록과 총합 새로고침
        fetchAssets();
        fetchTotalAssets();
      } else {
        throw new Error(response.data?.message || '자산 추가에 실패했습니다.');
      }
    } catch (error: any) {
      console.error('API 호출 오류:', error);
      // 에러 메시지 처리
      const errorMessage = 
        error.response?.data?.message || 
        error.response?.data?.error || 
        error.message || 
        '자산 추가에 실패했습니다.';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // 자산 삭제
  const handleDeleteAsset = async (assetId: number): Promise<void> => {
    if (!confirm('정말로 이 자산을 삭제하시겠습니까?')) {
      return;
    }

    try {
      const response = await api.delete<ApiResponse<Asset>>(`/asset/${assetId}`);
      
      // 응답 확인
      if (response.data?.success || response.status === 200 || response.status === 204) {
        alert('자산이 삭제되었습니다.');
        fetchAssets(); // 목록 새로고침
        fetchTotalAssets(); // 총합 새로고침
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

  // 금액 포맷팅
  const formatCurrency = (amount: number): string => {
    return `₩${amount.toLocaleString()}`;
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">자산 관리</h3>
          <button 
            onClick={openAccountModal}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            + 자산 추가
          </button>
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
                  
                  {/* 삭제 버튼 - 호버 시 표시 */}
                  <button
                    onClick={() => handleDeleteAsset(asset.id)}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                    title="자산 삭제"
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-gray-50 p-8 rounded-lg text-center">
            <div className="text-gray-400 text-4xl mb-4">💳</div>
            <p className="text-gray-600 mb-2">등록된 자산이 없습니다.</p>
            <p className="text-gray-500 text-sm mb-4">계좌나 카드를 추가해보세요.</p>
            <button 
              onClick={openAccountModal}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              첫 자산 추가하기
            </button>
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

      {/* 자산 추가 모달 */}
      {showAccountModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">자산 추가</h3>
              <button
                onClick={closeAccountModal}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleAddAccount} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  자산명 *
                </label>
                <input
                  type="text"
                  name="name"
                  value={accountForm.name}
                  onChange={handleInputChange}
                  placeholder="예: 신한은행 주계좌"
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  자산 유형
                </label>
                <select
                  name="type"
                  value={accountForm.type}
                  onChange={handleInputChange}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="account">계좌</option>
                  <option value="card">카드</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  초기 잔액
                </label>
                <input
                  type="number"
                  name="balance"
                  value={accountForm.balance}
                  onChange={handleInputChange}
                  placeholder="0"
                  className="w-full border rounded-lg px-3 py-2 text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeAccountModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {loading ? '추가 중...' : '추가'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}