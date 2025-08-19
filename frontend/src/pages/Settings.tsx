import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AssetSection } from '../components/settings/AssetSection';
import { CategorySection } from '../components/settings/CategorySections';
import { useAssets } from '../hooks/UseAssets';
import { useCategories } from '../hooks/UseCategories';

export default function Settings() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // 각 섹션의 로딩 상태
  const { loading: assetsLoading, fetchAssets } = useAssets();
  const { loading: categoriesLoading, fetchCategories, resetExpanded } = useCategories();

  const loadData = async (section: string) => {
    setError(null);
    
    try {
      if (section === 'assets') {
        await fetchAssets();
      } else if (section === 'categories') {
        await fetchCategories();
      }
    } catch (err: any) {
      const errorMessage = err.message || '데이터를 가져오는데 실패했습니다.';
      setError(errorMessage);
    }
  };

  const toggleSection = (section: string) => {
    const isExpanding = expandedSection !== section;
    setExpandedSection(isExpanding ? section : null);
    
    // 섹션이 확장될 때 데이터 로드
    if (isExpanding) {
      loadData(section);
      // 카테고리 섹션 초기화
      if (section === 'categories') {
        resetExpanded();
      }
    }
  };

  const handleBack = () => {
    navigate('/');
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
    {
      id: 'categories',
      title: '카테고리 관리',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      )
    }
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

              {/* 섹션 내용 */}
              {expandedSection === section.id && (
                <div className="px-6 pb-4 border-t border-gray-100">
                  {section.id === 'assets' && (
                    <AssetSection 
                      user={user} 
                      loading={assetsLoading}
                    />
                  )}
                  {section.id === 'categories' && (
                    <CategorySection 
                      user={user} 
                      loading={categoriesLoading}
                    />
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 추가 설정 섹션 */}
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