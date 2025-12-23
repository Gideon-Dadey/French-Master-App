const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const User = require('../models/User');
const Payment = require('../models/Payment');
const { protect, authorize } = require('../middleware/auth');

// All routes require admin role
router.use(protect);
router.use(authorize('admin'));

// @route   GET /api/admin/stats
// @desc    Get platform statistics
// @access  Private/Admin
router.get('/stats', async (req, res) => {
  try {
    const stats = {
      users: {
        total: await User.countDocuments(),
        students: await User.countDocuments({ role: 'student' }),
        instructors: await User.countDocuments({ role: 'instructor' })
      },
      courses: {
        total: await Course.countDocuments(),
        published: await Course.countDocuments({ status: 'published' }),
        draft: await Course.countDocuments({ status: 'draft' })
      },
      revenue: {
        total: await Payment.aggregate([
          { $match: { status: 'completed' } },
          { $group: { _id: null, total: { $sum: '$amount' } } }
        ]),
        thisMonth: await Payment.aggregate([
          {
            $match: {
              status: 'completed',
              paidAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
            }
          },
          { $group: { _id: null, total: { $sum: '$amount' } } }
        ])
      }
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;

