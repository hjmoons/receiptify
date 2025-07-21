const Receipt = require('../models/receipt');
const path = require('path');
const fs = require('fs').promises;

const receiptController = {
  // 영수증 업로드
  async upload(req, res) {
    try {
      const { userId } = req.user;
      const { file } = req;
      
      // Python AI 서비스 호출 (별도 구현 필요)
      const ocrResult = await callPythonOCR(file.path);
      
      // 영수증 저장
      const receipt = Receipt.create({
        userId,
        storeName: ocrResult.storeName,
        totalAmount: ocrResult.totalAmount,
        receiptDate: ocrResult.date,
        imagePath: file.path,
        ocrText: ocrResult.rawText,
        parsedData: JSON.stringify(ocrResult)
      });

      res.json({ success: true, receipt });
    } catch (error) {
      console.error('영수증 업로드 실패:', error);
      res.status(500).json({ error: '영수증 처리 중 오류가 발생했습니다.' });
    }
  },

  // 영수증 목록 조회
  async getReceipts(req, res) {
    const { userId } = req.user;
    const { page = 1, limit = 20 } = req.query;
    
    const offset = (page - 1) * limit;
    const receipts = Receipt.findByUser(userId, limit, offset);
    
    res.json({ receipts, page, limit });
  },

  // 월별 통계
  async getMonthlyStats(req, res) {
    const { userId } = req.user;
    const { year, month } = req.params;
    
    const yearMonth = `${year}-${month.padStart(2, '0')}`;
    const total = Receipt.getMonthlyTotal(userId, yearMonth);
    
    res.json({ year, month, total });
  },

  // 지출 분석
  async getAnalytics(req, res) {
    const { userId } = req.user;
    const { startDate, endDate } = req.query;
    
    const categories = Receipt.getExpensesByCategory(userId, startDate, endDate);
    
    res.json({ categories, period: { startDate, endDate } });
  }
};

module.exports = receiptController;