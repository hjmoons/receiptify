import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { ReceiptForm as ReceiptFormType } from '../types/receipt';
import type { Asset } from '../types/asset';
import type { Category } from '../types/category';
import api from '../utils/api';
import { AssetSelectModal } from '../components/common/AssetSelectModal';
import { CategorySelectModal } from '../components/common/CategorySelectModal';

export default function ReceiptForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isEditMode = !!id;

  const [form, setForm] = useState<ReceiptFormType>({
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
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [isTrsAssetModalOpen, setIsTrsAssetModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  useEffect(() => {
    if (!user.id) {
      navigate('/login');
      return;
    }

    fetchAssets();
    fetchCategories();

    if (isEditMode) {
      fetchReceipt();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchReceipt = async () => {
    try {
      const response = await api.get(`/receipt/${id}`);
      const receipt = response.data.data || response.data;
      setForm({
        type: receipt.type,
        cost: receipt.cost,
        content: receipt.content,
        location: receipt.location || '',
        transaction_date: receipt.transaction_date,
        asset_id: receipt.asset_id,
        trs_asset_id: receipt.trs_asset_id,
        category_id: receipt.category_id
      });
    } catch (error) {
      if (import.meta.env.DEV) console.error('가계부 내역 불러오기 실패:', error);
      alert('가계부 내역을 불러오는데 실패했습니다.');
      navigate('/');
    }
  };

  const fetchAssets = async () => {
    try {
      const response = await api.get('/asset');
      const assetData = Array.isArray(response.data.data) ? response.data.data :
                        Array.isArray(response.data) ? response.data : [];
      setAssets(assetData);
      if (assetData.length > 0 && !isEditMode) {
        setForm(prev => ({ ...prev, asset_id: assetData[0].id }));
      }
    } catch (error) {
      if (import.meta.env.DEV) console.error('자산 목록 불러오기 실패:', error);
      setAssets([]);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/category');
      const categoryData = Array.isArray(response.data.data) ? response.data.data :
                           Array.isArray(response.data) ? response.data : [];
      setCategories(categoryData);
    } catch (error) {
      if (import.meta.env.DEV) console.error('카테고리 목록 불러오기 실패:', error);
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
        trs_asset_id: typeValue === 2 ? prev.trs_asset_id : null,
        category_id: typeValue === 2 ? null : prev.category_id
      }));
    } else if (name === 'cost') {
      setForm(prev => ({ ...prev, cost: parseInt(value) || 0 }));
    } else if (name === 'asset_id' || name === 'trs_asset_id' || name === 'category_id') {
      const numValue = value ? parseInt(value) : null;
      setForm(prev => ({ ...prev, [name]: numValue }));
    } else if (name === 'transaction_date') {
      // datetime-local 값을 로컬 시간대를 유지하면서 ISO 형식으로 변환
      const isoDate = value ? `${value}:00.000Z` : undefined;
      setForm(prev => ({ ...prev, transaction_date: isoDate }));
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

      if (isEditMode) {
        response = await api.put(`/receipt/${id}`, form);
      } else {
        response = await api.post('/receipt', {
          ...form,
          user_id: user.id
        });
      }

      if (response.data?.success || response.status === 200 || response.status === 201) {
        alert(`가계부 내역이 성공적으로 ${isEditMode ? '수정' : '추가'}되었습니다!`);
        navigate('/');
      } else {
        throw new Error(response.data?.message || `가계부 내역 ${isEditMode ? '수정' : '추가'}에 실패했습니다.`);
      }
    } catch (error: any) {
      if (import.meta.env.DEV) console.error('API 호출 오류:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        `가계부 내역 ${isEditMode ? '수정' : '추가'}에 실패했습니다.`;
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/');
  };

  // 자산 선택 핸들러
  const handleAssetSelect = (assetId: number) => {
    setForm(prev => ({ ...prev, asset_id: assetId }));
  };

  const handleTrsAssetSelect = (assetId: number) => {
    setForm(prev => ({ ...prev, trs_asset_id: assetId }));
  };

  // 카테고리 선택 핸들러
  const handleCategorySelect = (categoryId: number | null, _categoryPath: string) => {
    setForm(prev => ({ ...prev, category_id: categoryId }));
  };

  // 선택된 자산/카테고리 이름 가져오기
  const getAssetName = (assetId: number) => {
    const asset = assets.find(a => a.id === assetId);
    return asset ? `${asset.name} (${asset.type === 'account' ? '계좌' : '카드'})` : '자산 선택';
  };

  const getCategoryName = (categoryId: number | null) => {
    if (categoryId === null) return '카테고리 선택';

    const category = categories.find(c => c.id === categoryId);
    if (!category) return '카테고리 선택';

    // 계층 구조로 경로 생성
    if (category.level === 1) {
      return category.name;
    }

    const parent = categories.find(c => c.id === category.parent_id);
    if (!parent) return category.name;

    if (parent.level === 1) {
      return `${parent.name}/${category.name}`;
    }

    const grandParent = categories.find(c => c.id === parent.parent_id);
    if (!grandParent) return `${parent.name}/${category.name}`;

    return `${grandParent.name}/${parent.name}/${category.name}`;
  };

  // 거래 유형에 따른 카테고리 필터링
  const filteredCategories = categories.filter(cat =>
    form.type === 0 ? cat.type === 0 : form.type === 1 ? cat.type === 1 : false
  );

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold">
              {isEditMode ? '가계부 내역 수정' : '가계부 내역 추가'}
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                거래 유형 *
              </label>
              <select
                name="type"
                value={form.type}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                거래 날짜/시간
              </label>
              <input
                type="datetime-local"
                name="transaction_date"
                value={form.transaction_date ? new Date(form.transaction_date).toISOString().slice(0, 16) : ''}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {form.type === 2 ? '출금 자산' : '자산'} *
              </label>
              <button
                type="button"
                onClick={() => setIsAssetModalOpen(true)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-blue-400"
              >
                {form.asset_id === 0 ? (
                  <span className="text-gray-400">자산 선택</span>
                ) : (
                  <span>{getAssetName(form.asset_id)}</span>
                )}
              </button>
            </div>

            {form.type === 2 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  입금 자산 *
                </label>
                <button
                  type="button"
                  onClick={() => setIsTrsAssetModalOpen(true)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-blue-400"
                >
                  {!form.trs_asset_id ? (
                    <span className="text-gray-400">자산 선택</span>
                  ) : (
                    <span>{getAssetName(form.trs_asset_id)}</span>
                  )}
                </button>
              </div>
            )}

            {form.type !== 2 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  카테고리
                </label>
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(true)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-blue-400"
                >
                  {!form.category_id ? (
                    <span className="text-gray-400">카테고리 선택</span>
                  ) : (
                    <span>{getCategoryName(form.category_id)}</span>
                  )}
                </button>
              </div>
            )}

            <div className="md:col-span-2 flex gap-4 pt-4">
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
              >
                {loading ? `${isEditMode ? '수정' : '추가'} 중...` : `${isEditMode ? '수정' : '추가'}`}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* 자산 선택 모달 */}
      <AssetSelectModal
        isOpen={isAssetModalOpen}
        assets={assets}
        selectedAssetId={form.asset_id}
        onClose={() => setIsAssetModalOpen(false)}
        onSelect={handleAssetSelect}
      />

      {/* 이체 대상 자산 선택 모달 */}
      <AssetSelectModal
        isOpen={isTrsAssetModalOpen}
        assets={assets}
        selectedAssetId={form.trs_asset_id || undefined}
        excludeAssetId={form.asset_id}
        onClose={() => setIsTrsAssetModalOpen(false)}
        onSelect={handleTrsAssetSelect}
      />

      {/* 카테고리 선택 모달 */}
      <CategorySelectModal
        isOpen={isCategoryModalOpen}
        categories={filteredCategories}
        selectedCategoryId={form.category_id}
        onClose={() => setIsCategoryModalOpen(false)}
        onSelect={handleCategorySelect}
      />
    </div>
  );
}
