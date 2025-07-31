import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

export default function Home() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [activeTab, setActiveTab] = useState('가계부');

  // 자산 추가 팝업 설정
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [accountForm, setAccountForm] = useState({
    name: '',
    type: 'account',
    balance: 0
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user.id) {
      navigate('/login');
    }
  }, [navigate, user.id]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  // 자산 추가 모달 열기
  const openAccountModal = () => {
    setShowAccountModal(true);
    setAccountForm({
      name: '',
      type: 'account',
      balance: 0
    });
  };

  // 자산 추가 모달 닫기
  const closeAccountModal = () => {
    setShowAccountModal(false);
    setAccountForm({
      name: '',
      type: 'account',
      balance: 0
    });
  };

  // 폼 입력 처리
  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setAccountForm(prev => ({
      ...prev,
      [name]: name === 'balance' ? parseInt(value) || 0 : value
    }));
  };

   // 자산 추가 API 호출
  const handleAddAccount = async (e: any) => {
    e.preventDefault();
    
    if (!accountForm.name.trim()) {
      alert('자산명을 입력해주세요.');
      return;
    }

    setLoading(true);
    
    try {
      const response = await api.post('/asset', {
        user_id: user.id,
        name: accountForm.name,
        type: accountForm.type,
        balance: accountForm.balance
      });

      alert('자산이 성공적으로 추가되었습니다!');
      closeAccountModal();
      // 페이지 새로고침하거나 자산 목록을 다시 불러올 수 있음
      // window.location.reload(); 또는 자산 목록 state 업데이트
    } catch (error: any) {
      console.error('API 호출 오류:', error);
      const errorMessage = error.response?.data?.message || '자산 추가에 실패했습니다.';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

 const tabs = ['가계부', '통계', '자산'];

  const renderTabContent = () => {
    switch (activeTab) {
      case '가계부':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">가계부 관리</h3>
              <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                + 내역 추가
              </button>
            </div>
            <div className="bg-gray-50 p-4 rounded">
              <p className="text-gray-600 text-center">아직 등록된 내역이 없습니다.</p>
              <p className="text-gray-500 text-sm text-center mt-2">수입과 지출을 기록해보세요.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-50 p-4 rounded border-l-4 border-green-500">
                <h4 className="font-semibold text-green-800">이번 달 수입</h4>
                <p className="text-2xl font-bold text-green-600">₩0</p>
              </div>
              <div className="bg-red-50 p-4 rounded border-l-4 border-red-500">
                <h4 className="font-semibold text-red-800">이번 달 지출</h4>
                <p className="text-2xl font-bold text-red-600">₩0</p>
              </div>
            </div>
          </div>
        );
      case '통계':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">지출 통계</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-6 rounded">
                <h4 className="font-semibold mb-4">카테고리별 지출</h4>
                <div className="h-48 flex items-center justify-center text-gray-500">
                  차트가 여기에 표시됩니다
                </div>
              </div>
              <div className="bg-gray-50 p-6 rounded">
                <h4 className="font-semibold mb-4">월별 지출 추이</h4>
                <div className="h-48 flex items-center justify-center text-gray-500">
                  차트가 여기에 표시됩니다
                </div>
              </div>
            </div>
            <div className="bg-white border rounded p-4">
              <h4 className="font-semibold mb-3">이번 달 Top 5 지출</h4>
              <div className="space-y-2">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="flex justify-between items-center py-2 border-b last:border-b-0">
                    <span className="text-gray-600">데이터 없음</span>
                    <span className="font-semibold">₩0</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case '자산':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">자산 관리</h3>
              <button 
                onClick={openAccountModal}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                + 자산 추가
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-blue-800">현금</h4>
                  <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded">CASH</span>
                </div>
                <p className="text-2xl font-bold text-blue-600">₩0</p>
              </div>
            </div>
            <div className="bg-white border rounded p-6">
              <h4 className="font-semibold mb-4">예산 설정</h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-gray-700">월 예산</label>
                  <input 
                    type="number" 
                    placeholder="0" 
                    className="border rounded px-3 py-2 w-32 text-right"
                  />
                </div>
                <div className="flex justify-between items-center">
                  <label className="text-gray-700">저축 목표</label>
                  <input 
                    type="number" 
                    placeholder="0" 
                    className="border rounded px-3 py-2 w-32 text-right"
                  />
                </div>
                <button className="w-full mt-4 px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900">
                  설정 저장
                </button>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-8">
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Receiptify</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            로그아웃
          </button>
        </div>
        
        {/* 사용자 인사말 */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold text-gray-800">안녕하세요, {user.name}님!</h2>
          <p className="text-gray-600 mt-1">오늘도 현명한 소비하세요.</p>
        </div>

        {/* 탭 메뉴 */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>
          
          {/* 탭 콘텐츠 */}
          <div className="p-6">
            {renderTabContent()}
          </div>
        </div>
      </div>

      {/* 자산 추가 모달 */}
      {showAccountModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">자산 추가</h3>
              <button
                onClick={closeAccountModal}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleAddAccount} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  자산명 *
                </label>
                <input
                  type="text"
                  name="name"
                  value={accountForm.name}
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
                  value={accountForm.type}
                  onChange={handleInputChange}
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
                  value={accountForm.balance}
                  onChange={handleInputChange}
                  placeholder="0"
                  className="w-full border rounded-lg px-3 py-2 text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeAccountModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {loading ? '추가 중...' : '추가'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}