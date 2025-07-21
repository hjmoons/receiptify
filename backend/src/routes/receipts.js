const express = require('express');
const router = express.Router();
const multer = require('multer');

// Multer 설정
const upload = multer({ dest: 'uploads/' });

// 영수증 업로드
router.post('/upload', upload.single('receipt'), (req, res) => {
  res.json({ 
    message: '영수증 업로드됨',
    file: req.file 
  });
});

// 영수증 목록 조회
router.get('/', (req, res) => {
  res.json({ message: '영수증 목록' });
});

module.exports = router;