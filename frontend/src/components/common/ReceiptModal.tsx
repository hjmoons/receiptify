import React, { useState, useEffect } from 'react';
import type { ReceiptForm, Receipt } from '../../types/receipt';
import type { Asset } from '../../types/asset';
import type { Category } from '../../types/category';
import api from '../../utils/api';

interface User {
  id: number;
}

interface ReceiptModalProps {
  isOpen: boolean;
  user: User;
  editingReceipt?: Receipt | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  user,
  editingReceipt = null,
  onClose,
  onSuccess
}) => {
  const [form, setForm] = useState<ReceiptForm>({
    type: 0,
    cost: 0,
    content: '',
    location: '',
    asset_id: 0,
    trs_asset_id: null,
    category_id: null
  });
  const [loading, setLoading] = useState(false);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  // 자산 및 카테고리 목록 불러오기
  useEffect(() => {
    if (isOpen) {
      fetchAssets();
      fetchCategories();
    }
  }, [isOpen]);

  // 수정 모드일 때 기존 데이터로 폼 초기화
  useEffect(() => {
    if (editingReceipt) {
      setForm({
        type: editingReceipt.type,
        cost: editingReceipt.cost,
        content: editingReceipt.content,
        location: editingReceipt.location || '',
        asset_id: editingReceipt.asset_id,
        trs_asset_id: editingReceipt.trs_asset_id,
        category_id: editingReceipt.category_id
      });
    } else {
      setForm({
        type: 0,
        cost: 0,
        content: '',
        location: '',
        asset_id: 0,
        trs_asset_id: null,
        category_id: null
      });
    }
  }, [editingReceipt]);

  const fetchAssets = async () => {
    try {
      const response = await api.get('/asset');
      const assetData = Array.isArray(response.data) ? response.data : [];
      setAssets(assetData);
      if (assetData.length > 0 && !editingReceipt) {
        setForm(prev => ({ ...prev, asset_id: assetData[0].id }));
      }
    } catch (error) {
      console.error('자산 목록 불러오기 실패:', error);
      setAssets([]);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/category');
      const categoryData = Array.isArray(response.data) ? response.data : [];
      setCategories(categoryData);
    } catch (error) {
      console.error('카테고리 목록 불러오기 실패:', error);
      setCategories([]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'type') {
      const typeValue = parseInt(value) as 0 | 1 | 2;
      setForm(prev => ({
        ...prev,
        type: typeValue,
        trs_asset_id: typeValue === 2 ? prev.trs_asset_id : null
      }));
    } else if (name === 'cost') {
      setForm(prev => ({ ...prev, cost: parseInt(value) || 0 }));
    } else if (name === 'asset_id' || name === 'trs_asset_id' || name === 'category_id') {
      const numValue = value ? parseInt(value) : null;
      setForm(prev => ({ ...prev, [name]: numValue }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.content.trim()) {
      alert('내용을 입력해주세요.');
      return;
    }

    if (form.asset_id === 0) {
      alert('자산을 선택해주세요.');
      return;
    }

    if (form.type === 2 && !form.trs_asset_id) {
      alert('이체 대상 자산을 선택해주세요.');
      return;
    }

    setLoading(true);

    try {
      let response;

      if (editingReceipt) {
        response = await api.put(`/receipt/${editingReceipt.id}`, form);
      } else {
        response = await api.post('/receipt', {
          ...form,
          user_id: user.id
        });
      }

      if (response.data?.success || response.status === 200 || response.status === 201) {
        alert(`가계부 내역이 성공적으로 ${editingReceipt ? '수정' : '추가'}되었습니다!`);
        handleClose();
        if (onSuccess) {
          onSuccess();
        }
      } else {
        throw new Error(response.data?.message || `가계부 내역 ${editingReceipt ? '수정' : '추가'}에 실패했습니다.`);
      }
    } catch (error: any) {
      console.error('API 호출 오류:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        `가계부 내역 ${editingReceipt ? '수정' : '추가'}에 실패했습니다.`;
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setForm({
      type: 0,
      cost: 0,
      content: '',
      location: '',
      asset_id: 0,
      trs_asset_id: null,
      category_id: null
    });
    onClose();
  };

  if (!isOpen) return null;

  // 거래 유형에 따른 카테고리 필터링
  const filteredCategories = categories.filter(cat =>
    form.type === 0 ? cat.type === 0 : form.type === 1 ? cat.type === 1 : false
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            {editingReceipt ? '내역 수정' : '내역 추가'}
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
              거래 유형 *
            </label>
            <select
              name="type"
              value={form.type}
              onChange={handleInputChange}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={0}>지출</option>
              <option value={1}>수입</option>
              <option value={2}>이체</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              금액 *
            </label>
            <input
              type="number"
              name="cost"
              value={form.cost}
              onChange={handleInputChange}
              placeholder="0"
              className="w-full border rounded-lg px-3 py-2 text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              내용 *
            </label>
            <input
              type="text"
              name="content"
              value={form.content}
              onChange={handleInputChange}
              placeholder="예: 점심 식사"
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              장소
            </label>
            <input
              type="text"
              name="location"
              value={form.location}
              onChange={handleInputChange}
              placeholder="예: 강남역 식당"
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {form.type === 2 ? '출금 자산' : '자산'} *
            </label>
            <select
              name="asset_id"
              value={form.asset_id}
              onChange={handleInputChange}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value={0}>자산 선택</option>
              {assets.map(asset => (
                <option key={asset.id} value={asset.id}>
                  {asset.name} ({asset.type === 'account' ? '계좌' : '카드'})
                </option>
              ))}
            </select>
          </div>

          {form.type === 2 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                입금 자산 *
              </label>
              <select
                name="trs_asset_id"
                value={form.trs_asset_id || 0}
                onChange={handleInputChange}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value={0}>자산 선택</option>
                {assets.filter(a => a.id !== form.asset_id).map(asset => (
                  <option key={asset.id} value={asset.id}>
                    {asset.name} ({asset.type === 'account' ? '계좌' : '카드'})
                  </option>
                ))}
              </select>
            </div>
          )}

          {form.type !== 2 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                카테고리
              </label>
              <select
                name="category_id"
                value={form.category_id || 0}
                onChange={handleInputChange}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={0}>카테고리 선택</option>
                {filteredCategories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          )}

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
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? `${editingReceipt ? '수정' : '추가'} 중...` : `${editingReceipt ? '수정' : '추가'}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
