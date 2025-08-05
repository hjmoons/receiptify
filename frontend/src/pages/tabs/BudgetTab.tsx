export default function BudgetTab() {
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
}