import React, { useState, useEffect } from 'react';
import type { AssetForm, Asset } from '../../types/asset';
import api from '../../utils/api';

interface User {
  id: number;
}

interface AssetModalProps {
  isOpen: boolean;
  user: User;
  editingAsset?: Asset | null; // 수정할 자산 정보
  onClose: () => void;
  onSuccess?: () => void; // 성공 후 추가 작업 (데이터 새로고침 등)
}

export const AssetModal: React.FC<AssetModalProps> = ({
  isOpen,
  user,
  editingAsset = null,
  onClose,
  onSuccess
}) => {
  const [form, setForm] = useState<AssetForm>({
    name: '',
    type: 'account',
    balance: 0
  });
  const [loading, setLoading] = useState(false);

  // 수정 모드일 때 기존 데이터로 폼 초기화
  useEffect(() => {
    if (editingAsset) {
      setForm({
        name: editingAsset.name,
        type: editingAsset.type,
        balance: editingAsset.balance
      });
    } else {
      setForm({
        name: '',
        type: 'account',
        balance: 0
      });
    }
  }, [editingAsset]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name === 'balance' ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.name.trim()) {
      alert('자산명을 입력해주세요.');
      return;
    }

    setLoading(true);
    
    try {
      let response;
      
      if (editingAsset) {
        // 수정 모드
        response = await api.put(`/asset/${editingAsset.id}`, {
          name: form.name,
          type: form.type,
          balance: form.balance
        });
      } else {
        // 추가 모드
        response = await api.post('/asset', {
          user_id: user.id,
          name: form.name,
          type: form.type,
          balance: form.balance
        });
      }

      // 응답 확인
      if (response.data?.success || response.status === 200 || response.status === 201) {
        alert(`자산이 성공적으로 ${editingAsset ? '수정' : '추가'}되었습니다!`);
        handleClose();
        // 성공 후 콜백 실행
        if (onSuccess) {
          onSuccess();
        }
      } else {
        throw new Error(response.data?.message || `자산 ${editingAsset ? '수정' : '추가'}에 실패했습니다.`);
      }
    } catch (error: any) {
      if (import.meta.env.DEV) console.error('API 호출 오류:', error);
      const errorMessage = 
        error.response?.data?.message || 
        error.response?.data?.error || 
        error.message || 
        `자산 ${editingAsset ? '수정' : '추가'}에 실패했습니다.`;
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setForm({ name: '', type: 'account', balance: 0 });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            {editingAsset ? '자산 수정' : '자산 추가'}
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
              자산명 *
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
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
              value={form.type}
              onChange={handleInputChange}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="account">계좌</option>
              <option value="card">카드</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {editingAsset ? '현재 잔액' : '초기 잔액'}
            </label>
            <input
              type="number"
              name="balance"
              value={form.balance}
              onChange={handleInputChange}
              placeholder="0"
              className="w-full border rounded-lg px-3 py-2 text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
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
              {loading ? `${editingAsset ? '수정' : '추가'} 중...` : `${editingAsset ? '수정' : '추가'}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};