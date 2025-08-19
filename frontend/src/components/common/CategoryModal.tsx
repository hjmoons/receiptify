import React, { useState, useEffect } from 'react';
import type { Category } from '../../types/category';

interface CategoryModalProps {
  isOpen: boolean;
  editingCategory: Category | null;
  categories: Category[];
  onClose: () => void;
  onSubmit: (data: { name: string; type: number; parent_id: number | null }, isEdit: boolean) => Promise<{ success: boolean; message: string }>;
  getCategoryTypeDisplay: (type: number) => string;
}

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  editingCategory,
  categories,
  onClose,
  onSubmit,
  getCategoryTypeDisplay
}) => {
  const [form, setForm] = useState({
    name: '',
    type: 1, // 기본값 수입
    parent_id: null as number | null
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingCategory) {
      setForm({
        name: editingCategory.name,
        type: editingCategory.type,
        parent_id: editingCategory.parent_id
      });
    } else {
      setForm({
        name: '',
        type: 1,
        parent_id: null
      });
    }
  }, [editingCategory]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name === 'type' ? parseInt(value) : 
              name === 'parent_id' ? (value === '' ? null : parseInt(value)) : 
              value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.name.trim()) {
      alert('카테고리명을 입력해주세요.');
      return;
    }

    setLoading(true);
    
    try {
      const result = await onSubmit(form, !!editingCategory);
      
      if (result.success) {
        alert(result.message);
        handleClose();
      } else {
        alert(result.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setForm({
      name: '',
      type: 1,
      parent_id: null
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            {editingCategory ? '카테고리 수정' : '카테고리 추가'}
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              카테고리명 *
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleInputChange}
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
              value={form.type}
              onChange={handleInputChange}
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
              value={form.parent_id || ''}
              onChange={handleInputChange}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">상위 카테고리 없음 (대분류)</option>
              {categories
                .filter(cat => cat.type === form.type && (!cat.parent_id || cat.parent_id === null))
                .map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              현재 {getCategoryTypeDisplay(form.type)} 대분류: {categories.filter(cat => cat.type === form.type && (!cat.parent_id || cat.parent_id === null)).length}개
            </p>
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? `${editingCategory ? '수정' : '추가'} 중...` : `${editingCategory ? '수정' : '추가'}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};