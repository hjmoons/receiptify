const express = require('express');
const router = express.Router();

// 회원가입
router.post('/register', (req, res) => {
  res.json({ message: '회원가입 엔드포인트' });
});

// 로그인
router.post('/login', (req, res) => {
  res.json({ message: '로그인 엔드포인트' });
});

module.exports = router;