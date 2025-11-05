import { useState, useEffect } from 'react';
import api from '../utils/api';
import type { Category } from '../types/category';

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedParentCategories, setExpandedParentCategories] = useState<Set<number>>(new Set());
  const [expandedCategoryTypes, setExpandedCategoryTypes] = useState<Set<number>>(new Set());

  // 카테고리 목록 가져오기
  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      
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
    } finally {
      setLoading(false);
    }
  };

  // 카테고리 추가
  const addCategory = async (categoryData: { name: string; type: number; user_id: number; parent_id: number | null }) => {
    try {
      const response = await api.post('/category', {
        ...categoryData,
        level: categoryData.parent_id ? 2 : 1
      });

      if (response.data?.success || response.status === 200 || response.status === 201) {
        return { success: true, message: '카테고리가 성공적으로 추가되었습니다!' };
      } else {
        throw new Error(response.data?.message || '카테고리 추가에 실패했습니다.');
      }
    } catch (error: any) {
      console.error('API 호출 오류:', error);
      const errorMessage = 
        error.response?.data?.message || 
        error.response?.data?.error || 
        error.message || 
        '카테고리 추가에 실패했습니다.';
      return { success: false, message: errorMessage };
    }
  };

  // 카테고리 수정
  const updateCategory = async (categoryId: number, categoryData: { name: string; type: number; user_id: number; parent_id: number | null }) => {
    try {
      const response = await api.put(`/category/${categoryId}`, {
        ...categoryData,
        level: categoryData.parent_id ? 2 : 1
      });

      if (response.data?.success || response.status === 200 || response.status === 201) {
        return { success: true, message: '카테고리가 성공적으로 수정되었습니다!' };
      } else {
        throw new Error(response.data?.message || '카테고리 수정에 실패했습니다.');
      }
    } catch (error: any) {
      console.error('API 호출 오류:', error);
      const errorMessage = 
        error.response?.data?.message || 
        error.response?.data?.error || 
        error.message || 
        '카테고리 수정에 실패했습니다.';
      return { success: false, message: errorMessage };
    }
  };

  // 카테고리 삭제
  const deleteCategory = async (categoryId: number) => {
    try {
      const response = await api.delete(`/category/${categoryId}`);
      
      if (response.data?.success || response.status === 200 || response.status === 204) {
        return { success: true, message: '카테고리가 삭제되었습니다.' };
      } else {
        throw new Error(response.data?.message || '카테고리 삭제에 실패했습니다.');
      }
    } catch (error: any) {
      console.error('카테고리 삭제 오류:', error);
      const errorMessage = 
        error.response?.data?.message || 
        error.response?.data?.error || 
        '카테고리 삭제에 실패했습니다.';
      return { success: false, message: errorMessage };
    }
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

  // 부모 카테고리 필터링
  const getParentCategories = (type: number) => {
    return categories.filter(category => 
      category.type === type && (!category.parent_id || category.parent_id === null)
    );
  };

  // 자식 카테고리 필터링
  const getChildCategories = (parentId: number) => {
    return categories.filter(category => category.parent_id === parentId);
  };

  // 카테고리 타입 표시
  const getCategoryTypeDisplay = (type: number) => {
    const typeMap: Record<number, string> = {
      0: '지출',
      1: '수입',
    };
    return typeMap[type] || '기타';
  };

  // 초기화
  const resetExpanded = () => {
    setExpandedCategoryTypes(new Set());
    setExpandedParentCategories(new Set());
  };

  return {
    categories,
    loading,
    error,
    expandedParentCategories,
    expandedCategoryTypes,
    fetchCategories,
    addCategory,
    updateCategory,
    deleteCategory,
    toggleCategoryType,
    toggleParentCategory,
    getParentCategories,
    getChildCategories,
    getCategoryTypeDisplay,
    resetExpanded
  };
};