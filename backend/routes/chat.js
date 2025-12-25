const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

router.get('/messages/:courseId', protect, async (req, res) => {

  res.json({
    success: true,
    message: 'Chat feature - implement with Socket.IO'
  });
});

module.exports = router;

