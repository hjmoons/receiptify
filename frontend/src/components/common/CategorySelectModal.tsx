import React, { useState } from 'react';
import type { Category } from '../../types/category';

interface CategorySelectModalProps {
  isOpen: boolean;
  categories: Category[];
  selectedCategoryId?: number | null;
  onClose: () => void;
  onSelect: (categoryId: number | null, categoryPath: string) => void;
}

export const CategorySelectModal: React.FC<CategorySelectModalProps> = ({
  isOpen,
  categories,
  selectedCategoryId,
  onClose,
  onSelect
}) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());

  if (!isOpen) return null;

  // Level 1 카테고리만 추출
  const level1Categories = categories.filter(cat => cat.level === 1);

  // 특정 부모의 자식 카테고리 가져오기
  const getChildCategories = (parentId: number) => {
    return categories.filter(cat => cat.parent_id === parentId);
  };

  // 카테고리 경로 생성
  const getCategoryPath = (categoryId: number): string => {
    const category = categories.find(cat => cat.id === categoryId);
    if (!category) return '';

    if (category.level === 1) {
      return category.name;
    }

    const parent = categories.find(cat => cat.id === category.parent_id);
    if (!parent) return category.name;

    if (parent.level === 1) {
      return `${parent.name}/${category.name}`;
    }

    const grandParent = categories.find(cat => cat.id === parent.parent_id);
    if (!grandParent) return `${parent.name}/${category.name}`;

    return `${grandParent.name}/${parent.name}/${category.name}`;
  };

  const toggleCategory = (categoryId: number) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const handleSelect = (categoryId: number | null) => {
    const path = categoryId ? getCategoryPath(categoryId) : '';
    onSelect(categoryId, path);
    onClose();
  };

  const renderCategory = (category: Category, depth: number = 0) => {
    const children = getChildCategories(category.id);
    const isExpanded = expandedCategories.has(category.id);
    const hasChildren = children.length > 0;
    const isChild = depth > 0;

    return (
      <div key={category.id}>
        <button
          onClick={() => {
            if (hasChildren) {
              toggleCategory(category.id);
            } else {
              handleSelect(category.id);
            }
          }}
          className={`w-full text-left ${isChild ? 'py-2' : 'p-4'} ${isChild ? '' : 'rounded-lg border'} transition-colors flex items-center justify-between ${
            selectedCategoryId === category.id
              ? isChild ? 'bg-blue-50 text-blue-700' : 'border-blue-500 bg-blue-50'
              : isChild ? 'hover:bg-gray-100' : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
          }`}
          style={{ paddingLeft: `${16 + depth * 20}px` }}
        >
          <div className={isChild ? 'font-normal text-sm' : 'font-medium'}>{category.name}</div>
          {!hasChildren && (
            <span className="text-blue-600 text-sm">선택</span>
          )}
        </button>

        {hasChildren && isExpanded && (
          <div>
            {children.map(child => renderCategory(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">카테고리 선택</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <div className="space-y-2">
          <button
            onClick={() => handleSelect(null)}
            className={`w-full text-left p-4 rounded-lg border transition-colors ${
              selectedCategoryId === null
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
            }`}
          >
            <div className="font-medium text-gray-500">카테고리 없음</div>
          </button>

          {level1Categories.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              등록된 카테고리가 없습니다.
            </div>
          ) : (
            level1Categories.map(category => renderCategory(category, 0))
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
