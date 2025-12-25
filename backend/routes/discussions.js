const express = require('express');
const router = express.Router();
const Discussion = require('../models/Discussion');
const { protect } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const {
      category,
      search,
      sort = 'recent',
      page = 1,
      limit = 20
    } = req.query;

    const query = {};

    if (category) query.category = category;
    if (search) {
      query.$text = { $search: search };
    }

    let sortOption = {};
    switch (sort) {
      case 'popular':
        sortOption = { views: -1, likeCount: -1, createdAt: -1 };
        break;
      case 'trending':

        sortOption = {
          lastActivityAt: -1,
          replyCount: -1,
          views: -1
        };
        break;
      case 'most-replied':
        sortOption = { replyCount: -1, createdAt: -1 };
        break;
      default:
        sortOption = { isPinned: -1, createdAt: -1 };
    }

    const skip = (page - 1) * limit;

    const discussions = await Discussion.find(query)
      .populate('author', 'name avatar')
      .populate('replies.user', 'name avatar')
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit))
      .select('-replies.likes');

    const total = await Discussion.countDocuments(query);

    res.json({
      success: true,
      count: discussions.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      data: discussions
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
    const discussion = await Discussion.findById(req.params.id)
      .populate('author', 'name avatar email')
      .populate('replies.user', 'name avatar email')
      .populate('relatedCourse', 'title thumbnail')
      .populate('relatedLesson', 'title');

    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: 'Discussion not found'
      });
    }

    discussion.incrementViews();
    await discussion.save();

    res.json({
      success: true,
      data: discussion
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
      title,
      content,
      category,
      tags,
      relatedCourse,
      relatedLesson
    } = req.body;

    const discussion = new Discussion({
      title,
      content,
      author: req.user._id,
      category: category || 'general',
      tags: tags || [],
      relatedCourse,
      relatedLesson
    });

    await discussion.save();

    const populatedDiscussion = await Discussion.findById(discussion._id)
      .populate('author', 'name avatar')
      .populate('relatedCourse', 'title')
      .populate('relatedLesson', 'title');

    res.status(201).json({
      success: true,
      data: populatedDiscussion
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create discussion',
      error: error.message
    });
  }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);

    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: 'Discussion not found'
      });
    }

    if (discussion.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the discussion author can update it'
      });
    }

    const allowedUpdates = ['title', 'content', 'category', 'tags', 'relatedCourse', 'relatedLesson'];
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        discussion[field] = req.body[field];
      }
    });

    discussion.markAsEdited();
    discussion.lastActivityAt = new Date();
    await discussion.save();

    const populatedDiscussion = await Discussion.findById(discussion._id)
      .populate('author', 'name avatar')
      .populate('replies.user', 'name avatar');

    res.json({
      success: true,
      data: populatedDiscussion
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update discussion',
      error: error.message
    });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);

    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: 'Discussion not found'
      });
    }

    if (discussion.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the discussion author can delete it'
      });
    }

    await discussion.deleteOne();

    res.json({
      success: true,
      message: 'Discussion deleted successfully'
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
    const discussion = await Discussion.findById(req.params.id);

    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: 'Discussion not found'
      });
    }

    discussion.toggleLike(req.user._id);
    await discussion.save();

    res.json({
      success: true,
      data: {
        likes: discussion.likes.length,
        hasLiked: discussion.hasLiked(req.user._id)
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

router.post('/:id/replies', protect, async (req, res) => {
  try {
    const { content } = req.body;
    const discussion = await Discussion.findById(req.params.id);

    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: 'Discussion not found'
      });
    }

    if (discussion.isLocked) {
      return res.status(403).json({
        success: false,
        message: 'This discussion is locked and cannot accept new replies'
      });
    }

    discussion.addReply(req.user._id, content);
    await discussion.save();

    const populatedDiscussion = await Discussion.findById(discussion._id)
      .populate('replies.user', 'name avatar');

    const newReply = populatedDiscussion.replies[populatedDiscussion.replies.length - 1];

    res.status(201).json({
      success: true,
      data: newReply
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to add reply',
      error: error.message
    });
  }
});

router.put('/:id/replies/:replyId', protect, async (req, res) => {
  try {
    const { content } = req.body;
    const discussion = await Discussion.findById(req.params.id);

    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: 'Discussion not found'
      });
    }

    const reply = discussion.replies.id(req.params.replyId);
    if (!reply) {
      return res.status(404).json({
        success: false,
        message: 'Reply not found'
      });
    }

    if (reply.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the reply author can update it'
      });
    }

    reply.content = content;
    reply.markAsEdited();
    discussion.lastActivityAt = new Date();
    await discussion.save();

    const populatedDiscussion = await Discussion.findById(discussion._id)
      .populate('replies.user', 'name avatar');

    res.json({
      success: true,
      data: populatedDiscussion.replies.id(req.params.replyId)
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update reply',
      error: error.message
    });
  }
});

router.delete('/:id/replies/:replyId', protect, async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);

    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: 'Discussion not found'
      });
    }

    const reply = discussion.replies.id(req.params.replyId);
    if (!reply) {
      return res.status(404).json({
        success: false,
        message: 'Reply not found'
      });
    }

    if (reply.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the reply author can delete it'
      });
    }

    reply.deleteOne();
    discussion.lastActivityAt = new Date();
    await discussion.save();

    res.json({
      success: true,
      message: 'Reply deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

router.post('/:id/replies/:replyId/like', protect, async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);

    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: 'Discussion not found'
      });
    }

    const reply = discussion.replies.id(req.params.replyId);
    if (!reply) {
      return res.status(404).json({
        success: false,
        message: 'Reply not found'
      });
    }

    reply.toggleLike(req.user._id);
    discussion.lastActivityAt = new Date();
    await discussion.save();

    res.json({
      success: true,
      data: {
        likes: reply.likes.length,
        hasLiked: reply.hasLiked(req.user._id)
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

module.exports = router;

