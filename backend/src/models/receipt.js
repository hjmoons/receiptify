const { db } = require('../config/database');

class Receipt {
  // Prepared statements (성능 향상)
  static statements = {
    insert: db.prepare(`
      INSERT INTO receipts (user_id, store_name, total_amount, receipt_date, image_path, ocr_text, parsed_data)
      VALUES (@userId, @storeName, @totalAmount, @receiptDate, @imagePath, @ocrText, @parsedData)
    `),
    
    findById: db.prepare('SELECT * FROM receipts WHERE id = ?'),
    
    findByUser: db.prepare(`
      SELECT * FROM receipts 
      WHERE user_id = ? 
      ORDER BY receipt_date DESC, created_at DESC
    `),
    
    findByUserWithPagination: db.prepare(`
      SELECT * FROM receipts 
      WHERE user_id = ? 
      ORDER BY receipt_date DESC, created_at DESC
      LIMIT ? OFFSET ?
    `),
    
    getMonthlyTotal: db.prepare(`
      SELECT SUM(total_amount) as total 
      FROM receipts 
      WHERE user_id = ? AND strftime('%Y-%m', receipt_date) = ?
    `),
    
    getExpensesByCategory: db.prepare(`
      SELECT 
        store_name,
        COUNT(*) as count,
        SUM(total_amount) as total
      FROM receipts
      WHERE user_id = ? AND receipt_date BETWEEN ? AND ?
      GROUP BY store_name
      ORDER BY total DESC
    `)
  };

  // 영수증 생성
  static create(receiptData) {
    const info = this.statements.insert.run(receiptData);
    return { id: info.lastInsertRowid, ...receiptData };
  }

  // ID로 조회
  static findById(id) {
    return this.statements.findById.get(id);
  }

  // 사용자별 영수증 조회
  static findByUser(userId, limit = 50, offset = 0) {
    if (limit) {
      return this.statements.findByUserWithPagination.all(userId, limit, offset);
    }
    return this.statements.findByUser.all(userId);
  }

  // 월별 총액
  static getMonthlyTotal(userId, yearMonth) {
    const result = this.statements.getMonthlyTotal.get(userId, yearMonth);
    return result?.total || 0;
  }

  // 기간별 카테고리 분석
  static getExpensesByCategory(userId, startDate, endDate) {
    return this.statements.getExpensesByCategory.all(userId, startDate, endDate);
  }

  // 트랜잭션 예시: 영수증과 항목들 함께 저장
  static createWithItems(receiptData, items) {
    const insertReceiptItems = db.prepare(`
      INSERT INTO receipt_items (receipt_id, item_name, quantity, price)
      VALUES (@receiptId, @itemName, @quantity, @price)
    `);

    const saveReceiptWithItems = db.transaction((receipt, items) => {
      const newReceipt = this.create(receipt);
      
      for (const item of items) {
        insertReceiptItems.run({
          receiptId: newReceipt.id,
          ...item
        });
      }
      
      return newReceipt;
    });

    return saveReceiptWithItems(receiptData, items);
  }

  // 영수증 삭제 (관련 항목도 자동 삭제 - CASCADE)
  static delete(id) {
    const stmt = db.prepare('DELETE FROM receipts WHERE id = ?');
    return stmt.run(id);
  }

  // 검색 기능
  static search(userId, searchTerm) {
    const stmt = db.prepare(`
      SELECT * FROM receipts
      WHERE user_id = ? AND (
        store_name LIKE ? OR
        ocr_text LIKE ?
      )
      ORDER BY receipt_date DESC
    `);
    
    const searchPattern = `%${searchTerm}%`;
    return stmt.all(userId, searchPattern, searchPattern);
  }
}

module.exports = Receipt;