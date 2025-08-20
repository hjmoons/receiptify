import db from '../config/database';
import { User, RegisterDTO } from '../types/user.type';

export class UserModel {
  static async create(userData: RegisterDTO): Promise<{changes: number, lastInsertRowid: number | bigint}> {
      const stmt = db.prepare(`
        INSERT INTO users (email, password, name)
        VALUES (@email, @password, @name)
      `);
      
      const result = stmt.run(userData);
      
      return {changes: result.changes, lastInsertRowid: result.lastInsertRowid};
  }

  static async findByEmail(email: string): Promise<User | undefined> {
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    return stmt.get(email) as User | undefined;
  }

  static async findById(id: number): Promise<User | undefined> {
    const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
    return stmt.get(id) as User | undefined;
  }
}