const express = require('express');
const router = express.Router();
const ProgressShare = require('../models/ProgressShare');
const { protect } = require('../middleware/auth');

// @route   GET /api/progress-share
// @desc    Get all progress shares with filters
// @access  Public (for public shares) / Protected (for private shares)
router.get('/', async (req, res) => {
  try {
    const {
      type,
      userId,
      courseId,
      sort = 'recent', // recent, popular, trending
      page = 1,
      limit = 20
    } = req.query;

    // Build query
    const query = { isPublic: true };

    if (type) query.type = type;
    if (userId) query.user = userId;
    if (courseId) query.course = courseId;

    // Sort options
    let sortOption = {};
    switch (sort) {
      case 'popular':
        sortOption = { likeCount: -1, commentCount: -1, createdAt: -1 };
        break;
      case 'trending':
        // Recent posts with high engagement
        sortOption = { 
          $expr: {
            $add: [
              { $multiply: [{ $size: '$likes' }, 2] },
              { $size: '$comments' },
              { $ifNull: ['$views', 0] }
            ]
          }
        };
        break;
      default: // recent
        sortOption = { createdAt: -1 };
    }

    // Pagination
    const skip = (page - 1) * limit;

    const shares = await ProgressShare.find(query)
      .populate('user', 'name avatar')
      .populate('course', 'title thumbnail')
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit));

    const total = await ProgressShare.countDocuments(query);

    res.json({
      success: true,
      count: shares.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      data: shares
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/progress-share/:id
// @desc    Get single progress share
// @access  Public (for public shares) / Protected (for private shares)
router.get('/:id', async (req, res) => {
  try {
    const share = await ProgressShare.findById(req.params.id)
      .populate('user', 'name avatar email')
      .populate('course', 'title thumbnail')
      .populate('likes.user', 'name avatar')
      .populate('comments.user', 'name avatar');

    if (!share) {
      return res.status(404).json({
        success: false,
        message: 'Progress share not found'
      });
    }

    // Check if user can access private share
    if (!share.isPublic && (!req.user || share.user._id.toString() !== req.user._id.toString())) {
      return res.status(403).json({
        success: false,
        message: 'This progress share is private'
      });
    }

    // Increment views
    share.incrementViews();
    await share.save();

    res.json({
      success: true,
      data: share
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   POST /api/progress-share
// @desc    Create a new progress share
// @access  Protected
router.post('/', protect, async (req, res) => {
  try {
    const {
      type,
      title,
      description,
      course,
      achievement,
      milestone,
      streak,
      certificate,
      stats,
      image,
      tags,
      isPublic = true
    } = req.body;

    const share = new ProgressShare({
      user: req.user._id,
      type,
      title,
      description,
      course,
      achievement,
      milestone,
      streak,
      certificate,
      stats: stats || {},
      image,
      tags: tags || [],
      isPublic
    });

    await share.save();

    const populatedShare = await ProgressShare.findById(share._id)
      .populate('user', 'name avatar')
      .populate('course', 'title thumbnail');

    res.status(201).json({
      success: true,
      data: populatedShare
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create progress share',
      error: error.message
    });
  }
});

// @route   PUT /api/progress-share/:id
// @desc    Update a progress share
// @access  Protected (author only)
router.put('/:id', protect, async (req, res) => {
  try {
    const share = await ProgressShare.findById(req.params.id);

    if (!share) {
      return res.status(404).json({
        success: false,
        message: 'Progress share not found'
      });
    }

    // Check if user is author
    if (share.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the author can update this share'
      });
    }

    // Update allowed fields
    const allowedUpdates = ['title', 'description', 'image', 'tags', 'isPublic'];
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        share[field] = req.body[field];
      }
    });

    await share.save();

    const populatedShare = await ProgressShare.findById(share._id)
      .populate('user', 'name avatar')
      .populate('course', 'title thumbnail');

    res.json({
      success: true,
      data: populatedShare
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update progress share',
      error: error.message
    });
  }
});

// @route   DELETE /api/progress-share/:id
// @desc    Delete a progress share
// @access  Protected (author only)
router.delete('/:id', protect, async (req, res) => {
  try {
    const share = await ProgressShare.findById(req.params.id);

    if (!share) {
      return res.status(404).json({
        success: false,
        message: 'Progress share not found'
      });
    }

    // Check if user is author
    if (share.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the author can delete this share'
      });
    }

    await share.deleteOne();

    res.json({
      success: true,
      message: 'Progress share deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   POST /api/progress-share/:id/like
// @desc    Toggle like on a progress share
// @access  Protected
router.post('/:id/like', protect, async (req, res) => {
  try {
    const share = await ProgressShare.findById(req.params.id);

    if (!share) {
      return res.status(404).json({
        success: false,
        message: 'Progress share not found'
      });
    }

    share.toggleLike(req.user._id);
    await share.save();

    res.json({
      success: true,
      data: {
        likes: share.likes.length,
        hasLiked: share.hasLiked(req.user._id)
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

// @route   POST /api/progress-share/:id/comments
// @desc    Add a comment to a progress share
// @access  Protected
router.post('/:id/comments', protect, async (req, res) => {
  try {
    const { content } = req.body;
    const share = await ProgressShare.findById(req.params.id);

    if (!share) {
      return res.status(404).json({
        success: false,
        message: 'Progress share not found'
      });
    }

    share.addComment(req.user._id, content);
    await share.save();

    const populatedShare = await ProgressShare.findById(share._id)
      .populate('comments.user', 'name avatar');

    const newComment = populatedShare.comments[populatedShare.comments.length - 1];

    res.status(201).json({
      success: true,
      data: newComment
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to add comment',
      error: error.message
    });
  }
});

// @route   POST /api/progress-share/:id/share
// @desc    Increment share count
// @access  Protected
router.post('/:id/share', protect, async (req, res) => {
  try {
    const share = await ProgressShare.findById(req.params.id);

    if (!share) {
      return res.status(404).json({
        success: false,
        message: 'Progress share not found'
      });
    }

    share.incrementShares();
    await share.save();

    res.json({
      success: true,
      data: {
        shares: share.shares
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

// @route   GET /api/progress-share/user/:userId
// @desc    Get all progress shares by a user
// @access  Public (for public shares)
router.get('/user/:userId', async (req, res) => {
  try {
    const { sort = 'recent', page = 1, limit = 20 } = req.query;

    const query = { 
      user: req.params.userId,
      isPublic: true 
    };

    let sortOption = {};
    if (sort === 'popular') {
      sortOption = { likeCount: -1, createdAt: -1 };
    } else {
      sortOption = { createdAt: -1 };
    }

    const skip = (page - 1) * limit;

    const shares = await ProgressShare.find(query)
      .populate('user', 'name avatar')
      .populate('course', 'title thumbnail')
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit));

    const total = await ProgressShare.countDocuments(query);

    res.json({
      success: true,
      count: shares.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      data: shares
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

