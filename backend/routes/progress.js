const express = require('express');
const router = express.Router();
const Progress = require('../models/Progress');
const Course = require('../models/Course');
const { protect } = require('../middleware/auth');

router.get('/course/:courseId', protect, async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId)
      .populate('lessons');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    const progressRecords = await Progress.find({
      user: req.user._id,
      course: req.params.courseId
    });

    const totalLessons = course.lessons.length;
    const completedLessons = progressRecords.filter(p => p.isCompleted).length;
    const progressPercentage = totalLessons > 0
      ? Math.round((completedLessons / totalLessons) * 100)
      : 0;

    const totalWatched = progressRecords.reduce(
      (sum, p) => sum + (p.watchedDuration || 0),
      0
    );

    res.json({
      success: true,
      data: {
        course: {
          id: course._id,
          title: course.title,
          totalLessons,
          totalDuration: course.duration
        },
        progress: {
          completedLessons,
          totalLessons,
          progressPercentage,
          totalWatched,
          lessons: progressRecords
        }
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

router.get('/dashboard', protect, async (req, res) => {
  try {
    const user = await req.user.populate('enrolledCourses.course');

    const stats = {
      totalCourses: user.enrolledCourses.length,
      completedCourses: 0,
      inProgressCourses: 0,
      totalLessonsCompleted: 0,
      totalTimeSpent: 0
    };

    for (const enrollment of user.enrolledCourses) {
      const progressRecords = await Progress.find({
        user: req.user._id,
        course: enrollment.course._id
      });

      const course = await Course.findById(enrollment.course._id)
        .populate('lessons');

      const completedCount = progressRecords.filter(p => p.isCompleted).length;
      const totalLessons = course.lessons.length;
      const progress = totalLessons > 0
        ? Math.round((completedCount / totalLessons) * 100)
        : 0;

      if (progress === 100) {
        stats.completedCourses++;
      } else if (progress > 0) {
        stats.inProgressCourses++;
      }

      stats.totalLessonsCompleted += completedCount;
      stats.totalTimeSpent += progressRecords.reduce(
        (sum, p) => sum + (p.watchedDuration || 0),
        0
      );
    }

    // Calculate overall average progress
    let totalProgressSum = 0;
    user.enrolledCourses.forEach(ec => {
      totalProgressSum += ec.progress || 0;
    });
    stats.totalProgress = stats.totalCourses > 0 ? Math.round(totalProgressSum / stats.totalCourses) : 0;

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

router.get('/activity', protect, async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get active days from Progress
    const progressRecords = await Progress.find({
      user: req.user._id,
      updatedAt: { $gte: thirtyDaysAgo }
    }).select('updatedAt');

    const activeDays = new Set();
    progressRecords.forEach(p => {
      activeDays.add(p.updatedAt.toISOString().split('T')[0]);
    });

    res.json({
      success: true,
      data: Array.from(activeDays).sort()
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

