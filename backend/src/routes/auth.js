const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

// 공개 라우트
router.post('/register', authController.register);
router.post('/login', authController.login);

// 보호된 라우트
router.get('/me', authMiddleware, authController.me);

module.exports = router;