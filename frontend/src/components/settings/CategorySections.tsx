import { useState, useEffect } from 'react';
import { useCategories } from '../../hooks/UseCategories';
import { useKebabMenu } from '../../hooks/UseKebabMenu';
import { KebabMenu } from './KebabMenu';
import { CategoryModal } from '../common/CategoryModal';
import type { Category } from '../../types/category';

interface User {
  id: number;
}

interface CategorySectionProps {
  user: User;
  loading: boolean;
}

export const CategorySection: React.FC<CategorySectionProps> = ({ user, loading }) => {
  const {
    categories,
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
    getCategoryTypeDisplay
  } = useCategories();

  const { openMenuId, menuRef, toggleKebabMenu, closeMenu } = useKebabMenu();

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // 섹션이 열릴 때 데이터 가져오기
  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCategory = () => {
    if (categories.length === 0) {
      fetchCategories();
    }
    setEditingCategory(null);
    setShowCategoryModal(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setShowCategoryModal(true);
    closeMenu();
  };

  const handleDeleteCategory = async (category: Category) => {
    const childCount = getChildCategories(category.id).length;
    
    let confirmMessage = `'${category.name}' 카테고리를 삭제하시겠습니까?`;
    if (childCount > 0) {
      confirmMessage += `\n\n⚠️ 이 카테고리에는 ${childCount}개의 하위 카테고리가 있습니다.\n하위 카테고리도 함께 삭제됩니다.`;
    }
    
    if (!confirm(confirmMessage)) {
      return;
    }

    closeMenu();

    const result = await deleteCategory(category.id);
    if (result.success) {
      alert(result.message);
      fetchCategories();
    } else {
      alert(result.message);
    }
  };

  const handleCloseCategoryModal = () => {
    setShowCategoryModal(false);
    setEditingCategory(null);
  };

  const handleSubmitCategory = async (
    data: { name: string; type: number; parent_id: number | null },
    isEdit: boolean
  ) => {
    const categoryData = {
      ...data,
      user_id: user.id
    };

    let result;
    if (isEdit && editingCategory) {
      result = await updateCategory(editingCategory.id, categoryData);
    } else {
      result = await addCategory(categoryData);
    }

    if (result.success) {
      fetchCategories();
    }

    return result;
  };

  return (
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
                      <div key={category.id} className="bg-white border border-gray-200 rounded-lg">
                        {/* 부모 카테고리 */}
                        <div className="flex items-center justify-between p-3">
                          <button
                            onClick={() => hasChildren && toggleParentCategory(category.id)}
                            className={`flex items-center space-x-3 flex-1 text-left transition-colors ${
                              hasChildren 
                                ? 'hover:bg-gray-50 cursor-pointer' 
                                : 'cursor-default'
                            }`}
                          >
                            <div className="w-2 h-2 rounded-full bg-green-400"></div>
                            <div className="font-medium text-gray-800">{category.name}</div>
                            {hasChildren && (
                              <div className="flex items-center space-x-2 ml-auto">
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
                              </div>
                            )}
                          </button>
                          
                          {/* 케밥 메뉴 */}
                          <KebabMenu 
                            category={category}
                            isOpen={openMenuId === category.id}
                            menuRef={openMenuId === category.id ? menuRef : undefined}
                            onToggle={toggleKebabMenu}
                            onEdit={handleEditCategory}
                            onDelete={handleDeleteCategory}
                          />
                        </div>

                        {/* 자식 카테고리들 */}
                        {hasChildren && isExpanded && (
                          <div className="border-t border-gray-100 bg-gray-50">
                            {childCats.map((childCategory) => (
                              <div
                                key={childCategory.id}
                                className="flex items-center justify-between p-3 ml-6 hover:bg-gray-100 transition-colors"
                              >
                                <div className="flex items-center space-x-3">
                                  <div className="w-1.5 h-1.5 rounded-full bg-green-300"></div>
                                  <div className="font-medium text-gray-700">{childCategory.name}</div>
                                </div>
                                
                                {/* 하위 카테고리 케밥 메뉴 */}
                                <KebabMenu 
                                  category={childCategory}
                                  isChild={true}
                                  isOpen={openMenuId === childCategory.id}
                                  menuRef={openMenuId === childCategory.id ? menuRef : undefined}
                                  onToggle={toggleKebabMenu}
                                  onEdit={handleEditCategory}
                                  onDelete={handleDeleteCategory}
                                />
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
                      <div key={category.id} className="bg-white border border-gray-200 rounded-lg">
                        {/* 부모 카테고리 */}
                        <div className="flex items-center justify-between p-3">
                          <button
                            onClick={() => hasChildren && toggleParentCategory(category.id)}
                            className={`flex items-center space-x-3 flex-1 text-left transition-colors ${
                              hasChildren 
                                ? 'hover:bg-gray-50 cursor-pointer' 
                                : 'cursor-default'
                            }`}
                          >
                            <div className="w-2 h-2 rounded-full bg-red-400"></div>
                            <div className="font-medium text-gray-800">{category.name}</div>
                            {hasChildren && (
                              <div className="flex items-center space-x-2 ml-auto">
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
                              </div>
                            )}
                          </button>
                          
                          {/* 케밥 메뉴 */}
                          <KebabMenu 
                            category={category}
                            isOpen={openMenuId === category.id}
                            menuRef={openMenuId === category.id ? menuRef : undefined}
                            onToggle={toggleKebabMenu}
                            onEdit={handleEditCategory}
                            onDelete={handleDeleteCategory}
                          />
                        </div>

                        {/* 자식 카테고리들 */}
                        {hasChildren && isExpanded && (
                          <div className="border-t border-gray-100 bg-gray-50">
                            {childCats.map((childCategory) => (
                              <div
                                key={childCategory.id}
                                className="flex items-center justify-between p-3 ml-6 hover:bg-gray-100 transition-colors"
                              >
                                <div className="flex items-center space-x-3">
                                  <div className="w-1.5 h-1.5 rounded-full bg-red-300"></div>
                                  <div className="font-medium text-gray-700">{childCategory.name}</div>
                                </div>
                                
                                {/* 하위 카테고리 케밥 메뉴 */}
                                <KebabMenu 
                                  category={childCategory}
                                  isChild={true}
                                  isOpen={openMenuId === childCategory.id}
                                  menuRef={openMenuId === childCategory.id ? menuRef : undefined}
                                  onToggle={toggleKebabMenu}
                                  onEdit={handleEditCategory}
                                  onDelete={handleDeleteCategory}
                                />
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

      {/* 카테고리 추가/수정 모달 */}
      <CategoryModal
        isOpen={showCategoryModal}
        editingCategory={editingCategory}
        categories={categories}
        onClose={handleCloseCategoryModal}
        onSubmit={handleSubmitCategory}
        getCategoryTypeDisplay={getCategoryTypeDisplay}
      />
    </div>
  );
};