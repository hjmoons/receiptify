import { Request, Response } from 'express';
import { UserModel } from '../models/user.model';
import { LoginDto, RegisterDto } from '../types/user.type';
import { generateToken } from '../utils/jwt.util';

export class UserController {
  static async register(req: Request<{}, {}, RegisterDto>, res: Response) {
    try {
      const { email, password, name } = req.body;

      // 유효성 검사
      if (!email || !password || !name) {
        return res.status(400).json({
          success: false,
          message: '모든 필드를 입력해주세요.'
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: '비밀번호는 최소 6자 이상이어야 합니다.'
        });
      }

      const user = await UserModel.create({ email, password, name });
      const token = generateToken(user.id!);

      res.status(201).json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        },
        token
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  static async login(req: Request<{}, {}, LoginDto>, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: '이메일과 비밀번호를 입력해주세요.'
        });
      }

      const user = await UserModel.findByEmail(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: '이메일 또는 비밀번호가 올바르지 않습니다.'
        });
      }

      const isValidPassword = await UserModel.verifyPassword(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: '이메일 또는 비밀번호가 올바르지 않습니다.'
        });
      }

      const token = generateToken(user.id!);

      res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        },
        token
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: '로그인 중 오류가 발생했습니다.'
      });
    }
  }
}