const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Course = require('../models/Course');
const { protect, authorize } = require('../middleware/auth');

router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('enrolledCourses.course', 'title thumbnail rating');

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

router.put('/profile', protect, async (req, res) => {
  try {
    const { name, phone, avatar, preferences } = req.body;

    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (avatar !== undefined) user.avatar = avatar;
    if (preferences) {
      user.preferences = { ...user.preferences, ...preferences };
    }

    await user.save();

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

router.get('/my-courses', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate({
        path: 'enrolledCourses.course',
        populate: {
          path: 'instructor',
          select: 'name avatar'
        }
      });

    res.json({
      success: true,
      count: user.enrolledCourses.length,
      data: user.enrolledCourses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

router.get('/instructor/students', protect, authorize('instructor', 'admin'), async (req, res) => {
  try {
    const { page = 1, limit = 20, search, courseId } = req.query;
    const skip = (page - 1) * limit;

    const courseQuery = { instructor: req.user._id };
    if (courseId) {
      courseQuery._id = courseId;
    }
    const courses = await Course.find(courseQuery).select('_id');
    const courseIds = courses.map(c => c._id);

    if (courseIds.length === 0) {
      return res.json({
        success: true,
        data: [],
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: 0,
          pages: 0
        }
      });
    }

    const enrollmentQuery = {
      'enrolledCourses.course': { $in: courseIds },
      role: 'student'
    };

    let usersQuery = {};
    if (search) {
      usersQuery.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const students = await User.find({
      ...usersQuery,
      ...enrollmentQuery
    })
      .select('-password')
      .populate({
        path: 'enrolledCourses.course',
        match: { _id: { $in: courseIds } },
        select: 'title thumbnail',
        populate: {
          path: 'instructor',
          select: 'name'
        }
      })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip(skip);

    const filteredStudents = students.filter(student =>
      student.enrolledCourses.some(enrollment => enrollment.course)
    );

    const total = await User.countDocuments({
      ...usersQuery,
      ...enrollmentQuery
    });

    res.json({
      success: true,
      data: filteredStudents,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

router.get('/instructor/students/:id', protect, authorize('instructor', 'admin'), async (req, res) => {
  try {

    const courses = await Course.find({ instructor: req.user._id }).select('_id');
    const courseIds = courses.map(c => c._id);

    if (courseIds.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Student not found in your courses'
      });
    }

    const student = await User.findOne({
      _id: req.params.id,
      role: 'student',
      'enrolledCourses.course': { $in: courseIds }
    })
      .select('-password')
      .populate({
        path: 'enrolledCourses.course',
        match: { _id: { $in: courseIds } },
        select: 'title thumbnail rating',
        populate: {
          path: 'instructor',
          select: 'name'
        }
      })
      .populate('enrolledCourses.completedLessons', 'title order');

    if (student) {
      student.enrolledCourses = student.enrolledCourses.filter(
        enrollment => enrollment.course && courseIds.includes(enrollment.course._id)
      );
    }

    if (!student || student.enrolledCourses.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Student not found in your courses'
      });
    }

    res.json({
      success: true,
      data: student
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

