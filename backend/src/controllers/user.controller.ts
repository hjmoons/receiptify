import { Request, Response, NextFunction } from 'express';
import { LoginDTO, RegisterDTO } from '../types/user.type';
import { createError } from '../errors/app.error';
import { UserService } from '../services/user.service';

export class UserController {
  static async register(req: Request<{}, {}, RegisterDTO>, res: Response, next: NextFunction) {
    try {
      const { email, password, name } = req.body;

      // 유효성 검사
      if (!email || !password || !name) {
        throw createError.validation("모든 필드");
      }

      if (password.length < 6) {
        throw createError.validation('비밀번호는 최소 6자 이상');
      }

      const userData: RegisterDTO = req.body;
      const result = await UserService.register(userData);

      const user = result.user;
      const token = result.token;

      console.log(user);
      console.log(token);
      
      res.status(201).json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        },
        token
      });
    } catch (error) {
      next(error)
    }
  }

  static async login(req: Request<{}, {}, LoginDTO>, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        throw createError.validation('이메일, 비밀번호');
      }

      const loginData: LoginDTO = req.body;
      const result = await UserService.login(loginData);

      const user = result.user;
      const token = result.token;

      res.status(200).json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        },
        token
      });
    } catch (error) {
      next(error);
    }
  }
}