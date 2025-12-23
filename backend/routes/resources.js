const express = require('express');
const router = express.Router();
const Resource = require('../models/Resource');
const { protect } = require('../middleware/auth');

// @route   GET /api/resources
// @desc    Get all resources with filters
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      category,
      language,
      level,
      search,
      sort,
      featured,
      page = 1,
      limit = 20
    } = req.query;

    // Build query
    const query = { status: 'published' };

    if (category) query.category = category;
    if (language) query.language = language;
    if (level) query.level = level;
    if (featured === 'true') query.featured = true;
    
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
    if (sort === 'downloads') sortOption = { downloads: -1 };
    if (sort === 'popular') sortOption = { downloads: -1, 'rating.average': -1 };

    // Pagination
    const skip = (page - 1) * limit;

    const resources = await Resource.find(query)
      .populate('uploadedBy', 'name avatar')
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit))
      .select('-__v');

    const total = await Resource.countDocuments(query);

    res.json({
      success: true,
      count: resources.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      data: resources
    });
  } catch (error) {
    console.error('Error fetching resources:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/resources/categories
// @desc    Get resource categories with counts
// @access  Public
router.get('/categories', async (req, res) => {
  try {
    const categories = await Resource.aggregate([
      { $match: { status: 'published' } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/resources/:id
// @desc    Get single resource
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id)
      .populate('uploadedBy', 'name avatar')
      .select('-__v');

    if (!resource || resource.status !== 'published') {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    res.json({
      success: true,
      data: resource
    });
  } catch (error) {
    console.error('Error fetching resource:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   POST /api/resources/:id/download
// @desc    Track resource download
// @access  Protected (optional - can be public too)
router.post('/:id/download', async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource || resource.status !== 'published') {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    // Increment download count
    resource.downloads += 1;
    await resource.save();

    res.json({
      success: true,
      message: 'Download tracked',
      data: {
        fileUrl: resource.fileUrl,
        title: resource.title,
        type: resource.type
      }
    });
  } catch (error) {
    console.error('Error tracking download:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/resources/:id/download-url
// @desc    Get download URL for resource
// @access  Public (or Protected if needed)
router.get('/:id/download-url', async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id)
      .select('fileUrl title type status');

    if (!resource || resource.status !== 'published') {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    // Increment download count
    resource.downloads += 1;
    await resource.save();

    res.json({
      success: true,
      data: {
        downloadUrl: resource.fileUrl,
        title: resource.title,
        type: resource.type
      }
    });
  } catch (error) {
    console.error('Error getting download URL:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;

