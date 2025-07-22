import db from '../config/database';
import bcrypt from 'bcryptjs';
import { User, RegisterDto } from '../types/auth.type';

export class UserModel {
  private static statements = {
    create: db.prepare(`
      INSERT INTO users (email, password, name)
      VALUES (@email, @password, @name)
    `),
    
    findByEmail: db.prepare('SELECT * FROM users WHERE email = ?'),
    
    findById: db.prepare('SELECT * FROM users WHERE id = ?')
  };

  static async create(userData: RegisterDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    try {
      const result = this.statements.create.run({
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

  static findByEmail(email: string): User | undefined {
    return this.statements.findByEmail.get(email) as User | undefined;
  }

  static findById(id: number): User | undefined {
    return this.statements.findById.get(id) as User | undefined;
  }

  static async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}