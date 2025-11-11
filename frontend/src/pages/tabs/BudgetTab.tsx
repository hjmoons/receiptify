import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import type { Receipt } from '../../types/receipt';
import type { Category } from '../../types/category';

interface GroupedReceipts {
  [date: string]: Receipt[];
}

export default function BudgetTab() {
  const navigate = useNavigate();
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [totals, setTotals] = useState({ income: 0, expend: 0 });

  // 현재 선택된 연도와 월
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    return {
      year: now.getFullYear(),
      month: now.getMonth() + 1 // 0-11 -> 1-12
    };
  });

  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [receiptsRes, categoriesRes, totalsRes] = await Promise.all([
        api.get(`/receipt?year=${selectedDate.year}&month=${selectedDate.month}`),
        api.get('/category'),
        api.get(`/receipt/total?year=${selectedDate.year}&month=${selectedDate.month}`)
      ]);

      const receiptsData = Array.isArray(receiptsRes.data.data) ? receiptsRes.data.data :
                          Array.isArray(receiptsRes.data) ? receiptsRes.data : [];
      const categoriesData = Array.isArray(categoriesRes.data.data) ? categoriesRes.data.data :
                            Array.isArray(categoriesRes.data) ? categoriesRes.data : [];

      setReceipts(receiptsData);
      setCategories(categoriesData);

      if (totalsRes.data.data) {
        setTotals({
          income: totalsRes.data.data.income || 0,
          expend: totalsRes.data.data.expend || 0
        });
      }
    } catch (error) {
      if (import.meta.env.DEV) console.error('데이터 불러오기 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  // 이전 달로 이동
  const handlePrevMonth = () => {
    setSelectedDate(prev => {
      if (prev.month === 1) {
        return { year: prev.year - 1, month: 12 };
      }
      return { ...prev, month: prev.month - 1 };
    });
  };

  // 다음 달로 이동
  const handleNextMonth = () => {
    setSelectedDate(prev => {
      if (prev.month === 12) {
        return { year: prev.year + 1, month: 1 };
      }
      return { ...prev, month: prev.month + 1 };
    });
  };

  // 현재 달로 돌아가기
  const handleToday = () => {
    const now = new Date();
    setSelectedDate({
      year: now.getFullYear(),
      month: now.getMonth() + 1
    });
  };

  const handleAddReceipt = () => {
    navigate('/receipt/add');
  };

  const handleEditReceipt = (id: number) => {
    navigate(`/receipt/edit/${id}`);
  };

  const handleDeleteReceipt = async (id: number) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) {
      return;
    }

    try {
      await api.delete(`/receipt/${id}`);
      alert('내역이 삭제되었습니다.');
      fetchData(); // 목록 새로고침
    } catch (error: any) {
      if (import.meta.env.DEV) console.error('삭제 실패:', error);
      alert(error.response?.data?.message || '삭제에 실패했습니다.');
    }
  };

  // 카테고리 이름 가져오기
  const getCategoryName = (categoryId: number | null) => {
    if (categoryId === null) return '';

    const category = categories.find(c => c.id === categoryId);
    if (!category) return '';

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

  // 날짜별로 그룹화
  const groupByDate = (receipts: Receipt[]): GroupedReceipts => {
    const grouped: GroupedReceipts = {};

    receipts.forEach(receipt => {
      const date = new Date(receipt.transaction_date).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'short'
      });

      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(receipt);
    });

    return grouped;
  };

  // 금액 포맷팅
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('ko-KR');
  };

  const groupedReceipts = groupByDate(receipts);
  const dateKeys = Object.keys(groupedReceipts);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  // 현재 날짜인지 확인
  const isCurrentMonth = () => {
    const now = new Date();
    return selectedDate.year === now.getFullYear() &&
           selectedDate.month === now.getMonth() + 1;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">가계부 관리</h3>
        <button
          onClick={handleAddReceipt}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          + 내역 추가
        </button>
      </div>

      {/* 월 선택 컨트롤 */}
      <div className="flex items-center justify-center space-x-4 bg-white p-4 rounded-lg shadow">
        <button
          onClick={handlePrevMonth}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          title="이전 달"
        >
          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="flex items-center space-x-3">
          <h3 className="text-xl font-bold text-gray-800">
            {selectedDate.year}년 {selectedDate.month}월
          </h3>
          {!isCurrentMonth() && (
            <button
              onClick={handleToday}
              className="text-sm px-3 py-1 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-colors"
            >
              이번 달
            </button>
          )}
        </div>

        <button
          onClick={handleNextMonth}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          title="다음 달"
        >
          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* 해당 월 수입/지출 요약 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-green-50 p-4 rounded border-l-4 border-green-500">
          <h4 className="font-semibold text-green-800">수입</h4>
          <p className="text-2xl font-bold text-green-600">₩{formatCurrency(totals.income)}</p>
        </div>
        <div className="bg-red-50 p-4 rounded border-l-4 border-red-500">
          <h4 className="font-semibold text-red-800">지출</h4>
          <p className="text-2xl font-bold text-red-600">₩{formatCurrency(totals.expend)}</p>
        </div>
      </div>

      {/* 가계부 내역 목록 */}
      <div className="space-y-6">
        {dateKeys.length === 0 ? (
          <div className="bg-gray-50 p-4 rounded">
            <p className="text-gray-600 text-center">아직 등록된 내역이 없습니다.</p>
            <p className="text-gray-500 text-sm text-center mt-2">수입과 지출을 기록해보세요.</p>
          </div>
        ) : (
          dateKeys.map(date => (
            <div key={date} className="space-y-2">
              {/* 날짜 헤더 */}
              <div className="flex items-center space-x-2">
                <h4 className="font-semibold text-gray-700">{date}</h4>
                <div className="flex-1 h-px bg-gray-200"></div>
              </div>

              {/* 해당 날짜의 내역들 */}
              <div className="space-y-2">
                {groupedReceipts[date].map(receipt => (
                  <div
                    key={receipt.id}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleEditReceipt(receipt.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          {/* 거래 유형 아이콘 */}
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            receipt.type === 0 ? 'bg-red-100' :
                            receipt.type === 1 ? 'bg-green-100' : 'bg-blue-100'
                          }`}>
                            {receipt.type === 0 ? (
                              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                            ) : receipt.type === 1 ? (
                              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                              </svg>
                            )}
                          </div>

                          {/* 내용 */}
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <p className="font-medium text-gray-800">{receipt.content}</p>
                              {receipt.category_id && (
                                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                                  {getCategoryName(receipt.category_id)}
                                </span>
                              )}
                            </div>
                            {receipt.location && (
                              <p className="text-sm text-gray-500 mt-1">{receipt.location}</p>
                            )}
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(receipt.transaction_date).toLocaleTimeString('ko-KR', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* 금액 */}
                      <div className="text-right ml-4">
                        <p className={`text-lg font-bold ${
                          receipt.type === 0 ? 'text-red-600' :
                          receipt.type === 1 ? 'text-green-600' : 'text-blue-600'
                        }`}>
                          {receipt.type === 0 ? '-' : receipt.type === 1 ? '+' : ''}
                          ₩{formatCurrency(receipt.cost)}
                        </p>
                      </div>

                      {/* 삭제 버튼 */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteReceipt(receipt.id);
                        }}
                        className="ml-2 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="삭제"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}