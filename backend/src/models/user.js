const { db } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  static statements = {
    create: db.prepare(`
      INSERT INTO users (email, password, name)
      VALUES (@email, @password, @name)
    `),
    
    findByEmail: db.prepare('SELECT * FROM users WHERE email = ?'),
    
    findById: db.prepare('SELECT * FROM users WHERE id = ?')
  };

  // 회원가입
  static async create(userData) {
    const { email, password, name } = userData;
    
    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 10);
    
    try {
      const info = this.statements.create.run({
        email,
        password: hashedPassword,
        name
      });
      
      return {
        id: info.lastInsertRowid,
        email,
        name
      };
    } catch (error) {
      if (error.message.includes('UNIQUE constraint failed')) {
        throw new Error('이미 존재하는 이메일입니다.');
      }
      throw error;
    }
  }

  // 이메일로 찾기
  static findByEmail(email) {
    return this.statements.findByEmail.get(email);
  }

  // ID로 찾기
  static findById(id) {
    return this.statements.findById.get(id);
  }

  // 비밀번호 검증
  static async verifyPassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}

module.exports = User;