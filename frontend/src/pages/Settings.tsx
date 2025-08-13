import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api'; // axios 인스턴스 import
import type { Asset } from '../types/asset';

export default function Settings() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forceUpdate, setForceUpdate] = useState(0); // 강제 리렌더링용

  // assets 상태 변화 모니터링
  useEffect(() => {
    console.log('Assets 상태 변경됨:', assets);
    console.log('Assets 길이:', assets.length);
  }, [assets]);

  // API 호출 함수들
  const fetchAssets = async () => {
    try {
      const response = await api.get('/asset');

      // 데이터 구조 확인
      let assetData;
      if (Array.isArray(response.data)) {
        assetData = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        assetData = response.data.data; // 중첩된 data 구조인 경우
      } else if (response.data && response.data.assets && Array.isArray(response.data.assets)) {
        assetData = response.data.assets; // assets 프로퍼티인 경우
      } else {
        console.error('알 수 없는 데이터 구조:', response.data);
        setError('잘못된 데이터 형식입니다.');
        return;
      }
      
      console.log('추출된 자산 데이터:', assetData);
      setAssets(assetData);
      console.log('setAssets 호출 완료');
      
      // 강제 리렌더링 트리거
      setForceUpdate(prev => prev + 1);
      
    } catch (err: any) {
      console.error('자산 목록 에러:', err);
      const errorMessage = err.response?.data?.error || err.message || '자산 목록을 가져오는데 실패했습니다.';
      setError(errorMessage);
    }
  };

  const loadData = async (section: string) => {
    setLoading(true);
    setError(null);
    
    try {
      if (section === 'assets') {
        await fetchAssets();
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section: string) => {
    const isExpanding = expandedSection !== section;
    setExpandedSection(isExpanding ? section : null);
    
    // 섹션이 확장될 때 데이터 로드
    if (isExpanding) {
      loadData(section);
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  const handleAddAsset = () => {
    console.log('자산 추가');
    // 실제로는 자산 추가 모달이나 페이지로 이동
  };

  const formatCurrency = (amount: number) => {
    return `₩${amount.toLocaleString()}`;
  };

  // 수정된 함수 - 타입 안전성 확보
  const getAssetTypeDisplay = (type: string) => {
    const typeMap: Record<string, string> = {
      'account': '계좌',
      'card': '카드',
    };
    return typeMap[type] || '기타'; // 'unknown' 대신 '기타'로 표시
  };

  const settingsSections = [
    {
      id: 'assets',
      title: '자산 관리',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      )
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-8">
        {/* 헤더 */}
        <div className="flex items-center mb-8">
          <button
            onClick={handleBack}
            className="mr-4 p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-3xl font-bold text-gray-800">설정</h1>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* 설정 섹션들 */}
        <div className="space-y-4">
          {settingsSections.map((section) => (
            <div key={section.id} className="bg-white rounded-lg shadow">
              {/* 섹션 헤더 */}
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="text-blue-600">
                    {section.icon}
                  </div>
                  <span className="text-lg font-medium text-gray-800">
                    {section.title}
                  </span>
                </div>
                <div className="text-gray-400">
                  <svg 
                    className={`w-5 h-5 transform transition-transform ${
                      expandedSection === section.id ? 'rotate-180' : ''
                    }`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {/* 자산 관리 섹션 내용 */}
              {expandedSection === section.id && section.id === 'assets' && (
                <div className="px-6 pb-4 border-t border-gray-100">
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
                            {assets.map((asset, index) => {
                              console.log(`Asset ${index}:`, asset);
                              console.log(`Asset ID: ${asset.id}, Name: ${asset.name}, Type: ${asset.type}, Balance: ${asset.balance}`);
                              return (
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
                                  <div className="text-right">
                                    <div className={`font-semibold ${
                                      (asset.balance || 0) >= 0 ? 'text-gray-800' : 'text-red-600'
                                    }`}>
                                      {formatCurrency(asset.balance || 0)}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
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
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 추가 설정 섹션 (나중에 확장 가능) */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">기타 설정</h3>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex justify-between items-center py-2">
              <span>앱 버전</span>
              <span className="text-gray-500">v1.0.0</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span>데이터 백업</span>
              <button className="text-blue-600 hover:text-blue-700">백업하기</button>
            </div>
            <div className="flex justify-between items-center py-2">
              <span>도움말</span>
              <button className="text-blue-600 hover:text-blue-700">보기</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}