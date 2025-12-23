const express = require('express');
const router = express.Router();
const Lesson = require('../models/Lesson');
const Course = require('../models/Course');
const Progress = require('../models/Progress');
const { protect } = require('../middleware/auth');

// @route   GET /api/lessons/course/:courseId
// @desc    Get all lessons for a course
// @access  Private (if course is paid)
router.get('/course/:courseId', protect, async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if user has access
    const user = req.user;
    const hasAccess = course.isFree || 
      user.enrolledCourses.some(ec => ec.course.toString() === course._id.toString());

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'You need to enroll in this course first'
      });
    }

    const lessons = await Lesson.find({ course: req.params.courseId })
      .sort({ order: 1 });

    res.json({
      success: true,
      count: lessons.length,
      data: lessons
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/lessons/:id
// @desc    Get single lesson
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id)
      .populate('course', 'title instructor');

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }

    // Check access
    const course = await Course.findById(lesson.course._id);
    const user = req.user;
    const hasAccess = course.isFree || 
      user.enrolledCourses.some(ec => ec.course.toString() === course._id.toString());

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'You need to enroll in this course first'
      });
    }

    // Get user progress for this lesson
    const progress = await Progress.findOne({
      user: user._id,
      lesson: lesson._id
    });

    res.json({
      success: true,
      data: {
        lesson,
        progress: progress || null
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

// @route   POST /api/lessons/:id/progress
// @desc    Update lesson progress
// @access  Private
router.post('/:id/progress', protect, async (req, res) => {
  try {
    const { watchedDuration, isCompleted } = req.body;
    const lesson = await Lesson.findById(req.params.id);

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }

    let progress = await Progress.findOne({
      user: req.user._id,
      lesson: lesson._id
    });

    if (progress) {
      progress.watchedDuration = watchedDuration || progress.watchedDuration;
      progress.totalDuration = lesson.videoDuration;
      progress.isCompleted = isCompleted !== undefined ? isCompleted : progress.isCompleted;
      if (isCompleted && !progress.completedAt) {
        progress.completedAt = new Date();
      }
      progress.lastWatchedAt = new Date();
      await progress.save();
    } else {
      progress = await Progress.create({
        user: req.user._id,
        course: lesson.course,
        lesson: lesson._id,
        watchedDuration: watchedDuration || 0,
        totalDuration: lesson.videoDuration,
        isCompleted: isCompleted || false,
        completedAt: isCompleted ? new Date() : null
      });
    }

    res.json({
      success: true,
      data: progress
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

