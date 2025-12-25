const express = require('express');
const router = express.Router();
const ProgressShare = require('../models/ProgressShare');
const { protect } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const {
      type,
      userId,
      courseId,
      sort = 'recent',
      page = 1,
      limit = 20
    } = req.query;

    const query = { isPublic: true };

    if (type) query.type = type;
    if (userId) query.user = userId;
    if (courseId) query.course = courseId;

    let sortOption = {};
    switch (sort) {
      case 'popular':
        sortOption = { likeCount: -1, commentCount: -1, createdAt: -1 };
        break;
      case 'trending':

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
      default:
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

    if (!share.isPublic && (!req.user || share.user._id.toString() !== req.user._id.toString())) {
      return res.status(403).json({
        success: false,
        message: 'This progress share is private'
      });
    }

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

router.put('/:id', protect, async (req, res) => {
  try {
    const share = await ProgressShare.findById(req.params.id);

    if (!share) {
      return res.status(404).json({
        success: false,
        message: 'Progress share not found'
      });
    }

    if (share.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the author can update this share'
      });
    }

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

router.delete('/:id', protect, async (req, res) => {
  try {
    const share = await ProgressShare.findById(req.params.id);

    if (!share) {
      return res.status(404).json({
        success: false,
        message: 'Progress share not found'
      });
    }

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

