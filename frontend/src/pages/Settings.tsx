import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api'; // axios 인스턴스 import
import type { Asset } from '../types/asset';
import type { Category } from '../types/category';

export default function Settings() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [childCategories, setChildCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 카테고리 관련 상태
  const [expandedParentCategories, setExpandedParentCategories] = useState<Set<number>>(new Set());
  const [expandedCategoryTypes, setExpandedCategoryTypes] = useState<Set<number>>(new Set()); // 0: 지출, 1: 수입

  // 자산 추가 모달 상태
  const [showAssetModal, setShowAssetModal] = useState<boolean>(false);
  const [assetForm, setAssetForm] = useState({
    name: '',
    type: 'account',
    balance: 0
  });
  const [assetLoading, setAssetLoading] = useState<boolean>(false);

  // 카테고리 추가 모달 상태
  const [showCategoryModal, setShowCategoryModal] = useState<boolean>(false);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    type: 1, // 0: 지출, 1: 수입
    parent_id: null as number | null
  });
  const [categoryLoading, setCategoryLoading] = useState<boolean>(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // assets 상태 변화 모니터링
  useEffect(() => {
    console.log('Assets 상태 변경됨:', assets);
    console.log('Assets 길이:', assets.length);
  }, [assets]);

  // categories 상태 변화 모니터링
  useEffect(() => {
    console.log('Categories 상태 변경됨:', categories);
    console.log('Categories 길이:', categories.length);
  }, [categories]);

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
      
    } catch (err: any) {
      console.error('자산 목록 에러:', err);
      const errorMessage = err.response?.data?.error || err.message || '자산 목록을 가져오는데 실패했습니다.';
      setError(errorMessage);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/category');
      
      // 데이터 구조 확인
      let categoryData;
      if (Array.isArray(response.data)) {
        categoryData = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        categoryData = response.data.data;
      } else if (response.data && response.data.categories && Array.isArray(response.data.categories)) {
        categoryData = response.data.categories;
      } else {
        console.error('알 수 없는 카테고리 데이터 구조:', response.data);
        setError('잘못된 카테고리 데이터 형식입니다.');
        return;
      }
      
      console.log('추출된 카테고리 데이터:', categoryData);
      setCategories(categoryData);
      
    } catch (err: any) {
      console.error('카테고리 목록 에러:', err);
      const errorMessage = err.response?.data?.error || err.message || '카테고리 목록을 가져오는데 실패했습니다.';
      setError(errorMessage);
    }
  };

  const loadData = async (section: string) => {
    setLoading(true);
    setError(null);
    
    try {
      if (section === 'assets') {
        await fetchAssets();
      } else if (section === 'categories') {
        await fetchCategories();
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
      // 카테고리 섹션 초기화
      if (section === 'categories') {
        setExpandedCategoryTypes(new Set());
        setExpandedParentCategories(new Set());
      }
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  const handleAddAsset = () => {
    setShowAssetModal(true);
    setAssetForm({
      name: '',
      type: 'account',
      balance: 0
    });
  };

  // 자산 추가 모달 닫기
  const closeAssetModal = () => {
    setShowAssetModal(false);
    setAssetForm({
      name: '',
      type: 'account',
      balance: 0
    });
  };

  // 폼 입력 처리
  const handleAssetInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAssetForm(prev => ({
      ...prev,
      [name]: name === 'balance' ? parseInt(value) || 0 : value
    }));
  };

  // 자산 추가 API 호출
  const handleSubmitAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!assetForm.name.trim()) {
      alert('자산명을 입력해주세요.');
      return;
    }

    setAssetLoading(true);
    
    try {
      const response = await api.post('/asset', {
        user_id: user.id,
        name: assetForm.name,
        type: assetForm.type,
        balance: assetForm.balance
      });

      // 응답 확인
      if (response.data?.success || response.status === 200 || response.status === 201) {
        alert('자산이 성공적으로 추가되었습니다!');
        closeAssetModal();
        // 자산 목록 새로고침
        if (expandedSection === 'assets') {
          await fetchAssets();
        }
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
      alert(errorMessage);
    } finally {
      setAssetLoading(false);
    }
  };

  const handleAddCategory = () => {
    // 카테고리 목록이 없으면 먼저 로드
    if (categories.length === 0) {
      fetchCategories();
    }
    setEditingCategory(null); // 새 카테고리 추가
    setShowCategoryModal(true);
    setCategoryForm({
      name: '',
      type: 1, // 기본값 수입
      parent_id: null
    });
  };

  // 카테고리 수정 모달 열기
  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setShowCategoryModal(true);
    setCategoryForm({
      name: category.name,
      type: category.type,
      parent_id: category.parent_id
    });
  };

  // 카테고리 추가 모달 닫기
  const closeCategoryModal = () => {
    setShowCategoryModal(false);
    setEditingCategory(null);
    setCategoryForm({
      name: '',
      type: 1,
      parent_id: null
    });
  };

  // 카테고리 폼 입력 처리
  const handleCategoryInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCategoryForm(prev => ({
      ...prev,
      [name]: name === 'type' ? parseInt(value) : 
              name === 'parent_id' ? (value === '' ? null : parseInt(value)) : 
              value
    }));
  };

  // 카테고리 추가/수정 API 호출
  const handleSubmitCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!categoryForm.name.trim()) {
      alert('카테고리명을 입력해주세요.');
      return;
    }

    setCategoryLoading(true);
    
    try {
      let response;
      
      if (editingCategory) {
        // 수정
        response = await api.put(`/category/${editingCategory.id}`, {
          name: categoryForm.name,
          type: categoryForm.type,
          level: categoryForm.parent_id ? 1 : 0,
          user_id: user.id,
          parent_id: categoryForm.parent_id
        });
      } else {
        // 추가
        response = await api.post('/category', {
          name: categoryForm.name,
          type: categoryForm.type,
          level: categoryForm.parent_id ? 1 : 0,
          user_id: user.id,
          parent_id: categoryForm.parent_id
        });
      }

      // 응답 확인
      if (response.data?.success || response.status === 200 || response.status === 201) {
        alert(`카테고리가 성공적으로 ${editingCategory ? '수정' : '추가'}되었습니다!`);
        closeCategoryModal();
        // 카테고리 목록 새로고침
        if (expandedSection === 'categories') {
          await fetchCategories();
        }
      } else {
        throw new Error(response.data?.message || `카테고리 ${editingCategory ? '수정' : '추가'}에 실패했습니다.`);
      }
    } catch (error: any) {
      console.error('API 호출 오류:', error);
      const errorMessage = 
        error.response?.data?.message || 
        error.response?.data?.error || 
        error.message || 
        `카테고리 ${editingCategory ? '수정' : '추가'}에 실패했습니다.`;
      alert(errorMessage);
    } finally {
      setCategoryLoading(false);
    }
  };

  // 카테고리 삭제
  const handleDeleteCategory = async (category: Category) => {
    const childCount = getChildCategories(category.id).length;
    
    let confirmMessage = `'${category.name}' 카테고리를 삭제하시겠습니까?`;
    if (childCount > 0) {
      confirmMessage += `\n\n⚠️ 이 카테고리에는 ${childCount}개의 하위 카테고리가 있습니다.\n하위 카테고리도 함께 삭제됩니다.`;
    }
    
    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      const response = await api.delete(`/category/${category.id}`);
      
      if (response.data?.success || response.status === 200 || response.status === 204) {
        alert('카테고리가 삭제되었습니다.');
        // 카테고리 목록 새로고침
        if (expandedSection === 'categories') {
          await fetchCategories();
        }
      } else {
        throw new Error(response.data?.message || '카테고리 삭제에 실패했습니다.');
      }
    } catch (error: any) {
      console.error('카테고리 삭제 오류:', error);
      const errorMessage = 
        error.response?.data?.message || 
        error.response?.data?.error || 
        '카테고리 삭제에 실패했습니다.';
      alert(errorMessage);
    }
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

  // 카테고리 타입 토글
  const toggleCategoryType = (type: number) => {
    const newExpanded = new Set(expandedCategoryTypes);
    if (newExpanded.has(type)) {
      newExpanded.delete(type);
    } else {
      newExpanded.add(type);
    }
    setExpandedCategoryTypes(newExpanded);
    // 카테고리 타입이 변경되면 부모 카테고리 확장 상태 초기화
    setExpandedParentCategories(new Set());
  };

  // 부모 카테고리 토글
  const toggleParentCategory = (categoryId: number) => {
    const newExpanded = new Set(expandedParentCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedParentCategories(newExpanded);
  };

  // 카테고리 필터링 함수들
  const getParentCategories = (type: number) => {
    return categories.filter(category => 
      category.type === type && (!category.parent_id || category.parent_id === null)
    );
  };

  const getChildCategories = (parentId: number) => {
    return categories.filter(category => category.parent_id === parentId);
  };

  const getCategoryTypeDisplay = (type: number) => {
    const typeMap: Record<number, string> = {
      0: '지출',
      1: '수입',
    };
    return typeMap[type] || '기타';
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

              {/* 카테고리 관리 섹션 내용 */}
              {expandedSection === section.id && section.id === 'categories' && (
                <div className="px-6 pb-4 border-t border-gray-100">
                  <div className="pt-4">
                    <h4 className="text-sm font-medium text-gray-500 mb-3">카테고리 목록</h4>
                    
                    {loading ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {/* 수입 카테고리 섹션 */}
                        <div className="border border-gray-200 rounded-lg">
                          <button
                            onClick={() => toggleCategoryType(1)}
                            className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 rounded-lg transition-colors"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-3 h-3 rounded-full bg-green-500"></div>
                              <span className="font-medium text-green-700">수입 카테고리</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-gray-500">
                                {categories.filter(c => c.type === 1).length}개
                              </span>
                              <svg 
                                className={`w-4 h-4 text-gray-400 transform transition-transform ${
                                  expandedCategoryTypes.has(1) ? 'rotate-180' : ''
                                }`}
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                          </button>

                          {/* 수입 카테고리 목록 */}
                          {expandedCategoryTypes.has(1) && (
                            <div className="border-t border-gray-100 bg-gray-50 p-3 space-y-2">
                              {getParentCategories(1).length > 0 ? (
                                getParentCategories(1).map((category) => {
                                  const childCats = getChildCategories(category.id);
                                  const hasChildren = childCats.length > 0;
                                  const isExpanded = expandedParentCategories.has(category.id);

                                  return (
                                    <div key={category.id} className="bg-white border border-gray-200 rounded-lg group">
                                      {/* 부모 카테고리 */}
                                      <div className="relative">
                                        <button
                                          onClick={() => hasChildren && toggleParentCategory(category.id)}
                                          className={`w-full p-3 flex items-center justify-between text-left transition-colors ${
                                            hasChildren 
                                              ? 'hover:bg-gray-50 cursor-pointer' 
                                              : 'cursor-default'
                                          } ${isExpanded ? 'bg-gray-50' : ''}`}
                                        >
                                          <div className="flex items-center space-x-3">
                                            <div className="w-2 h-2 rounded-full bg-green-400"></div>
                                            <div className="font-medium text-gray-800">{category.name}</div>
                                          </div>
                                          <div className="flex items-center space-x-2">
                                            {hasChildren && (
                                              <>
                                                <span className="text-xs text-gray-500">{childCats.length}개</span>
                                                <svg 
                                                  className={`w-4 h-4 text-gray-400 transform transition-transform ${
                                                    isExpanded ? 'rotate-180' : ''
                                                  }`}
                                                  fill="none" 
                                                  stroke="currentColor" 
                                                  viewBox="0 0 24 24"
                                                >
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                              </>
                                            )}
                                          </div>
                                        </button>
                                        
                                        {/* 수정/삭제 버튼 */}
                                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleEditCategory(category);
                                            }}
                                            className="bg-blue-500 hover:bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                                            title="카테고리 수정"
                                          >
                                            ✏
                                          </button>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleDeleteCategory(category);
                                            }}
                                            className="bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                                            title="카테고리 삭제"
                                          >
                                            ×
                                          </button>
                                        </div>
                                      </div>

                                      {/* 자식 카테고리들 */}
                                      {hasChildren && isExpanded && (
                                        <div className="border-t border-gray-100 bg-gray-50">
                                          {childCats.map((childCategory) => (
                                            <div
                                              key={childCategory.id}
                                              className="flex items-center space-x-3 p-3 ml-6 hover:bg-gray-100 transition-colors group relative"
                                            >
                                              <div className="w-1.5 h-1.5 rounded-full bg-green-300"></div>
                                              <div className="font-medium text-gray-700 flex-1">{childCategory.name}</div>
                                              
                                              {/* 하위 카테고리 수정/삭제 버튼 */}
                                              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                                                <button
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleEditCategory(childCategory);
                                                  }}
                                                  className="bg-blue-500 hover:bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                                                  title="카테고리 수정"
                                                >
                                                  ✏
                                                </button>
                                                <button
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteCategory(childCategory);
                                                  }}
                                                  className="bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                                                  title="카테고리 삭제"
                                                >
                                                  ×
                                                </button>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })
                              ) : (
                                <div className="text-center py-4 text-gray-500 text-sm">
                                  등록된 수입 카테고리가 없습니다.
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* 지출 카테고리 섹션 */}
                        <div className="border border-gray-200 rounded-lg">
                          <button
                            onClick={() => toggleCategoryType(0)}
                            className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 rounded-lg transition-colors"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-3 h-3 rounded-full bg-red-500"></div>
                              <span className="font-medium text-red-700">지출 카테고리</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-gray-500">
                                {categories.filter(c => c.type === 0).length}개
                              </span>
                              <svg 
                                className={`w-4 h-4 text-gray-400 transform transition-transform ${
                                  expandedCategoryTypes.has(0) ? 'rotate-180' : ''
                                }`}
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                          </button>

                          {/* 지출 카테고리 목록 */}
                          {expandedCategoryTypes.has(0) && (
                            <div className="border-t border-gray-100 bg-gray-50 p-3 space-y-2">
                              {getParentCategories(0).length > 0 ? (
                                getParentCategories(0).map((category) => {
                                  const childCats = getChildCategories(category.id);
                                  const hasChildren = childCats.length > 0;
                                  const isExpanded = expandedParentCategories.has(category.id);

                                  return (
                                    <div key={category.id} className="bg-white border border-gray-200 rounded-lg group">
                                      {/* 부모 카테고리 */}
                                      <div className="relative">
                                        <button
                                          onClick={() => hasChildren && toggleParentCategory(category.id)}
                                          className={`w-full p-3 flex items-center justify-between text-left transition-colors ${
                                            hasChildren 
                                              ? 'hover:bg-gray-50 cursor-pointer' 
                                              : 'cursor-default'
                                          } ${isExpanded ? 'bg-gray-50' : ''}`}
                                        >
                                          <div className="flex items-center space-x-3">
                                            <div className="w-2 h-2 rounded-full bg-red-400"></div>
                                            <div className="font-medium text-gray-800">{category.name}</div>
                                          </div>
                                          <div className="flex items-center space-x-2">
                                            {hasChildren && (
                                              <>
                                                <span className="text-xs text-gray-500">{childCats.length}개</span>
                                                <svg 
                                                  className={`w-4 h-4 text-gray-400 transform transition-transform ${
                                                    isExpanded ? 'rotate-180' : ''
                                                  }`}
                                                  fill="none" 
                                                  stroke="currentColor" 
                                                  viewBox="0 0 24 24"
                                                >
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                              </>
                                            )}
                                          </div>
                                        </button>
                                        
                                        {/* 수정/삭제 버튼 */}
                                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleEditCategory(category);
                                            }}
                                            className="bg-blue-500 hover:bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                                            title="카테고리 수정"
                                          >
                                            ✏
                                          </button>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleDeleteCategory(category);
                                            }}
                                            className="bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                                            title="카테고리 삭제"
                                          >
                                            ×
                                          </button>
                                        </div>
                                      </div>

                                      {/* 자식 카테고리들 */}
                                      {hasChildren && isExpanded && (
                                        <div className="border-t border-gray-100 bg-gray-50">
                                          {childCats.map((childCategory) => (
                                            <div
                                              key={childCategory.id}
                                              className="flex items-center space-x-3 p-3 ml-6 hover:bg-gray-100 transition-colors group relative"
                                            >
                                              <div className="w-1.5 h-1.5 rounded-full bg-red-300"></div>
                                              <div className="font-medium text-gray-700 flex-1">{childCategory.name}</div>
                                              
                                              {/* 하위 카테고리 수정/삭제 버튼 */}
                                              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                                                <button
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleEditCategory(childCategory);
                                                  }}
                                                  className="bg-blue-500 hover:bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                                                  title="카테고리 수정"
                                                >
                                                  ✏
                                                </button>
                                                <button
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteCategory(childCategory);
                                                  }}
                                                  className="bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                                                  title="카테고리 삭제"
                                                >
                                                  ×
                                                </button>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })
                              ) : (
                                <div className="text-center py-4 text-gray-500 text-sm">
                                  등록된 지출 카테고리가 없습니다.
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* 디버깅용 정보 */}
                        <div className="text-xs text-gray-400 mt-4 space-y-1">
                          <div>총 {categories.length}개 카테고리</div>
                          <div>수입: {categories.filter(c => c.type === 1).length}개</div>
                          <div>지출: {categories.filter(c => c.type === 0).length}개</div>
                        </div>
                      </div>
                    )}
                    
                    {/* 카테고리 추가 버튼 */}
                    <button
                      onClick={handleAddCategory}
                      className="w-full mt-4 py-3 border-2 border-dashed border-gray-300 text-gray-500 hover:border-blue-400 hover:text-blue-600 rounded-lg transition-colors flex items-center justify-center space-x-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <span className="font-medium">카테고리 추가</span>
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

      {/* 자산 추가 모달 */}
      {showAssetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">자산 추가</h3>
              <button
                onClick={closeAssetModal}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSubmitAsset} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  자산명 *
                </label>
                <input
                  type="text"
                  name="name"
                  value={assetForm.name}
                  onChange={handleAssetInputChange}
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
                  value={assetForm.type}
                  onChange={handleAssetInputChange}
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
                  value={assetForm.balance}
                  onChange={handleAssetInputChange}
                  placeholder="0"
                  className="w-full border rounded-lg px-3 py-2 text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeAssetModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={assetLoading}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {assetLoading ? '추가 중...' : '추가'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 카테고리 추가 모달 */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {editingCategory ? '카테고리 수정' : '카테고리 추가'}
              </h3>
              <button
                onClick={closeCategoryModal}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSubmitCategory} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  카테고리명 *
                </label>
                <input
                  type="text"
                  name="name"
                  value={categoryForm.name}
                  onChange={handleCategoryInputChange}
                  placeholder="예: 식비, 교통비, 급여 등"
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  카테고리 유형
                </label>
                <select
                  name="type"
                  value={categoryForm.type}
                  onChange={handleCategoryInputChange}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={1}>수입</option>
                  <option value={0}>지출</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  상위 카테고리 (선택사항)
                </label>
                <select
                  name="parent_id"
                  value={categoryForm.parent_id || ''}
                  onChange={handleCategoryInputChange}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">상위 카테고리 없음 (대분류)</option>
                  {categories
                    .filter(cat => cat.type === categoryForm.type && (!cat.parent_id || cat.parent_id === null))
                    .map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  현재 {getCategoryTypeDisplay(categoryForm.type)} 대분류: {categories.filter(cat => cat.type === categoryForm.type && (!cat.parent_id || cat.parent_id === null)).length}개
                </p>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeCategoryModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={categoryLoading}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {categoryLoading ? `${editingCategory ? '수정' : '추가'} 중...` : `${editingCategory ? '수정' : '추가'}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 카테고리 추가 모달 */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">카테고리 추가</h3>
              <button
                onClick={closeCategoryModal}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSubmitCategory} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  카테고리명 *
                </label>
                <input
                  type="text"
                  name="name"
                  value={categoryForm.name}
                  onChange={handleCategoryInputChange}
                  placeholder="예: 식비, 교통비, 급여 등"
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  카테고리 유형
                </label>
                <select
                  name="type"
                  value={categoryForm.type}
                  onChange={handleCategoryInputChange}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={1}>수입</option>
                  <option value={0}>지출</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  상위 카테고리 (선택사항)
                </label>
                <select
                  name="parent_id"
                  value={categoryForm.parent_id || ''}
                  onChange={handleCategoryInputChange}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">상위 카테고리 없음 (대분류)</option>
                  {categories
                    .filter(cat => cat.type === categoryForm.type && (!cat.parent_id || cat.parent_id === null))
                    .map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                </select>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeCategoryModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={categoryLoading}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {categoryLoading ? '추가 중...' : '추가'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}