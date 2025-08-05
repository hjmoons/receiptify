export default function StatisticsTab() {
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
}