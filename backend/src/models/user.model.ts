import db from '../config/database';
import bcrypt from 'bcryptjs';
import { User, RegisterDto } from '../types/auth.type';

export class UserModel {
  // prepare문을 메서드 안에서 실행
  static async create(userData: RegisterDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    try {
      const stmt = db.prepare(`
        INSERT INTO users (email, password, name)
        VALUES (@email, @password, @name)
      `);
      
      const result = stmt.run({
        email: userData.email,
        password: hashedPassword,
        name: userData.name
      });
      
      return {
        id: result.lastInsertRowid as number,
        email: userData.email,
        name: userData.name,
        password: hashedPassword
      };
    } catch (error: any) {
      if (error.message.includes('UNIQUE constraint failed')) {
        throw new Error('이미 존재하는 이메일입니다.');
      }
      throw error;
    }
  }

  static async findByEmail(email: string): Promise<User | undefined> {
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    return stmt.get(email) as User | undefined;
  }

  static async findById(id: number): Promise<User | undefined> {
    const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
    return stmt.get(id) as User | undefined;
  }

  static async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}