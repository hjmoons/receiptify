import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BudgetTab from './tabs/BudgetTab';
import StatisticsTab from './tabs/StatisticsTab';
import AssetsTab from './tabs/AssetsTab';

export default function Home() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [activeTab, setActiveTab] = useState<string>('가계부');

  useEffect(() => {
    if (!user.id) {
      navigate('/login');
    }
  }, [navigate, user.id]);

  const handleLogout = (): void => {
    localStorage.clear();
    navigate('/login');
  };

  const tabs: string[] = ['가계부', '통계', '자산'];

  const renderTabContent = () => {
    switch (activeTab) {
      case '가계부':
        return <BudgetTab />;
      case '통계':
        return <StatisticsTab />;
      case '자산':
        return <AssetsTab user={user} />;
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
    </div>
  );
}