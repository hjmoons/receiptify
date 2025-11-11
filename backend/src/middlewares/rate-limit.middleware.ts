import rateLimit from 'express-rate-limit';

// 일반 API용 rate limiter - 15분에 100개 요청
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 100, // 최대 100개 요청
  message: {
    success: false,
    code: 'RATE_LIMIT_EXCEEDED',
    message: '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.'
  },
  standardHeaders: true, // `RateLimit-*` 헤더 반환
  legacyHeaders: false, // `X-RateLimit-*` 헤더 비활성화
});

// 로그인 API용 strict rate limiter - 15분에 5개 요청
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 5, // 최대 5개 요청
  message: {
    success: false,
    code: 'AUTH_RATE_LIMIT_EXCEEDED',
    message: '로그인 시도 횟수가 초과되었습니다. 15분 후 다시 시도해주세요.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // IP별로 카운트
  skipSuccessfulRequests: true, // 성공한 요청은 카운트하지 않음
});

// 회원가입 API용 rate limiter - 1시간에 3개 요청
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1시간
  max: 3, // 최대 3개 요청
  message: {
    success: false,
    code: 'REGISTER_RATE_LIMIT_EXCEEDED',
    message: '회원가입 시도 횟수가 초과되었습니다. 1시간 후 다시 시도해주세요.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
