const express = require('express');
const router = express.Router();
const Tag = require('../models/Tag');
const Course = require('../models/Course');
const Blog = require('../models/Blog');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/tags
// @desc    Get all tags
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { search, sort } = req.query;
    const query = {};

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    let sortOption = { name: 1 };
    if (sort === 'popular') sortOption = { courseCount: -1, postCount: -1 };
    if (sort === 'newest') sortOption = { createdAt: -1 };

    const tags = await Tag.find(query).sort(sortOption);

    res.json({
      success: true,
      count: tags.length,
      data: tags
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/tags/:id
// @desc    Get tag by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const tag = await Tag.findById(req.params.id);

    if (!tag) {
      return res.status(404).json({
        success: false,
        message: 'Tag not found'
      });
    }

    res.json({
      success: true,
      data: tag
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/tags/slug/:slug
// @desc    Get tag by slug
// @access  Public
router.get('/slug/:slug', async (req, res) => {
  try {
    const tag = await Tag.findOne({ slug: req.params.slug });

    if (!tag) {
      return res.status(404).json({
        success: false,
        message: 'Tag not found'
      });
    }

    res.json({
      success: true,
      data: tag
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   POST /api/tags
// @desc    Create a new tag
// @access  Private (Admin)
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const tag = await Tag.create(req.body);

    res.status(201).json({
      success: true,
      data: tag
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to create tag',
      error: error.message
    });
  }
});

// @route   PUT /api/tags/:id
// @desc    Update tag
// @access  Private (Admin)
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const tag = await Tag.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!tag) {
      return res.status(404).json({
        success: false,
        message: 'Tag not found'
      });
    }

    res.json({
      success: true,
      data: tag
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to update tag',
      error: error.message
    });
  }
});

// @route   DELETE /api/tags/:id
// @desc    Delete tag
// @access  Private (Admin)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const tag = await Tag.findByIdAndDelete(req.params.id);

    if (!tag) {
      return res.status(404).json({
        success: false,
        message: 'Tag not found'
      });
    }

    res.json({
      success: true,
      message: 'Tag deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/tags/:id/courses
// @desc    Get courses with this tag
// @access  Public
router.get('/:id/courses', async (req, res) => {
  try {
    const tag = await Tag.findById(req.params.id);
    if (!tag) {
      return res.status(404).json({
        success: false,
        message: 'Tag not found'
      });
    }

    const courses = await Course.find({
      tags: { $in: [tag.name] },
      status: 'published'
    }).populate('instructor', 'name avatar');

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

