const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const { protect } = require('../middleware/auth');

// @route   GET /api/courses
// @desc    Get all courses with filters
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      category,
      level,
      language,
      minPrice,
      maxPrice,
      isFree,
      search,
      sort,
      page = 1,
      limit = 10
    } = req.query;

    // Build query
    const query = { status: 'published' };

    if (category) query.category = category;
    if (level) query.level = level;
    if (language) query.language = language;
    if (isFree !== undefined && isFree !== null) {
      query.isFree = isFree === 'true' || isFree === true;
    }
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Sort options
    let sortOption = { createdAt: -1 };
    if (sort === 'rating') sortOption = { 'rating.average': -1 };
    if (sort === 'popular') sortOption = { studentsEnrolled: -1 };
    if (sort === 'price-low') sortOption = { price: 1 };
    if (sort === 'price-high') sortOption = { price: -1 };

    // Pagination
    const skip = (page - 1) * limit;

    const courses = await Course.find(query)
      .populate('instructor', 'name avatar')
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit));

    const total = await Course.countDocuments(query);

    res.json({
      success: true,
      count: courses.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      data: courses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/courses/:id
// @desc    Get single course
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'name avatar bio')
      .populate('lessons', 'title order videoDuration isPreview');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    res.json({
      success: true,
      data: course
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/courses/featured
// @desc    Get featured courses
// @access  Public
router.get('/featured/list', async (req, res) => {
  try {
    const courses = await Course.find({
      featured: true,
      status: 'published'
    })
      .populate('instructor', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      count: courses.length,
      data: courses
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

