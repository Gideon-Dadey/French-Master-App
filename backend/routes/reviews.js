const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Review = require('../models/Review');
const Course = require('../models/Course');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

router.get('/course/:courseId', async (req, res) => {
  try {

    if (!mongoose.Types.ObjectId.isValid(req.params.courseId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid course ID format'
      });
    }

    const reviews = await Review.find({ course: req.params.courseId })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const { courseId, rating, comment } = req.body;

    const user = await User.findById(req.user._id);
    const isEnrolled = user.enrolledCourses.some(
      ec => ec.course.toString() === courseId
    );

    if (!isEnrolled) {
      return res.status(403).json({
        success: false,
        message: 'You must be enrolled to review this course'
      });
    }

    const existingReview = await Review.findOne({
      user: req.user._id,
      course: courseId
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this course'
      });
    }

    const review = await Review.create({
      user: req.user._id,
      course: courseId,
      rating,
      comment
    });

    await updateCourseRating(courseId);

    res.status(201).json({
      success: true,
      data: review
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

async function updateCourseRating(courseId) {
  const reviews = await Review.find({ course: courseId });
  const average = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  await Course.findByIdAndUpdate(courseId, {
    'rating.average': Math.round(average * 10) / 10,
    'rating.count': reviews.length
  });
}

module.exports = router;

