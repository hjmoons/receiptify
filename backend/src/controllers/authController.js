const User = require('../models/user');
const { generateToken } = require('../utils/jwt');

const authController = {
  // 회원가입
  async register(req, res) {
    try {
      const { email, password, name } = req.body;

      // 유효성 검사
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: '이메일과 비밀번호는 필수입니다.'
        });
      }

      // 이메일 형식 검사
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: '올바른 이메일 형식이 아닙니다.'
        });
      }

      // 비밀번호 길이 검사
      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: '비밀번호는 최소 6자 이상이어야 합니다.'
        });
      }

      // 사용자 생성
      const user = await User.create({ email, password, name });
      const token = generateToken(user.id);

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
      console.error('회원가입 에러:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  },

  // 로그인
  async login(req, res) {
    try {
      const { email, password } = req.body;

      // 유효성 검사
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: '이메일과 비밀번호를 입력해주세요.'
        });
      }

      // 사용자 찾기
      const user = User.findByEmail(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: '이메일 또는 비밀번호가 올바르지 않습니다.'
        });
      }

      // 비밀번호 검증
      const isValidPassword = await User.verifyPassword(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: '이메일 또는 비밀번호가 올바르지 않습니다.'
        });
      }

      // 토큰 생성
      const token = generateToken(user.id);

      res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        },
        token
      });
    } catch (error) {
      console.error('로그인 에러:', error);
      res.status(500).json({
        success: false,
        message: '로그인 중 오류가 발생했습니다.'
      });
    }
  },

  // 현재 사용자 정보
  async me(req, res) {
    const user = User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '사용자를 찾을 수 없습니다.'
      });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });
  }
};

module.exports = authController;