const express = require('express');
const router = express.Router();
const Question = require('../models/Question');
const { protect } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const {
      category,
      status,
      isSolved,
      search,
      sort = 'recent',
      page = 1,
      limit = 20
    } = req.query;

    const query = {};

    if (category) query.category = category;
    if (status) query.status = status;
    if (isSolved !== undefined) query.isSolved = isSolved === 'true';
    if (search) {
      query.$text = { $search: search };
    }

    let sortOption = {};
    switch (sort) {
      case 'popular':
        sortOption = { views: -1, upvotes: -1 };
        break;
      case 'unanswered':
        sortOption = { answerCount: 1, createdAt: -1 };
        query['answers.0'] = { $exists: false };
        break;
      case 'solved':
        sortOption = { solvedAt: -1 };
        query.isSolved = true;
        break;
      case 'trending':

        sortOption = { lastActivityAt: -1, views: -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    const skip = (page - 1) * limit;

    const questions = await Question.find(query)
      .populate('author', 'name avatar')
      .populate('answers.user', 'name avatar')
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit))
      .select('-answers.comments');

    const total = await Question.countDocuments(query);

    res.json({
      success: true,
      count: questions.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      data: questions
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
    const question = await Question.findById(req.params.id)
      .populate('author', 'name avatar email')
      .populate('answers.user', 'name avatar email')
      .populate('answers.comments.user', 'name avatar')
      .populate('relatedCourse', 'title')
      .populate('relatedLesson', 'title');

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    question.incrementViews();
    await question.save();

    res.json({
      success: true,
      data: question
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

    const question = new Question({
      title,
      content,
      author: req.user._id,
      category: category || 'general',
      tags: tags || [],
      relatedCourse,
      relatedLesson
    });

    await question.save();

    const populatedQuestion = await Question.findById(question._id)
      .populate('author', 'name avatar')
      .populate('relatedCourse', 'title')
      .populate('relatedLesson', 'title');

    res.status(201).json({
      success: true,
      data: populatedQuestion
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create question',
      error: error.message
    });
  }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    if (question.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the question author can update it'
      });
    }

    const allowedUpdates = ['title', 'content', 'category', 'tags', 'relatedCourse', 'relatedLesson'];
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        question[field] = req.body[field];
      }
    });

    question.lastActivityAt = new Date();
    await question.save();

    const populatedQuestion = await Question.findById(question._id)
      .populate('author', 'name avatar')
      .populate('answers.user', 'name avatar');

    res.json({
      success: true,
      data: populatedQuestion
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update question',
      error: error.message
    });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    if (question.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the question author can delete it'
      });
    }

    await question.deleteOne();

    res.json({
      success: true,
      message: 'Question deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

router.post('/:id/upvote', protect, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    question.addUpvote(req.user._id);
    await question.save();

    res.json({
      success: true,
      data: {
        upvotes: question.upvotes.length,
        downvotes: question.downvotes.length,
        voteScore: question.voteScore
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

router.post('/:id/downvote', protect, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    question.addDownvote(req.user._id);
    await question.save();

    res.json({
      success: true,
      data: {
        upvotes: question.upvotes.length,
        downvotes: question.downvotes.length,
        voteScore: question.voteScore
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

router.post('/:id/answers', protect, async (req, res) => {
  try {
    const { content } = req.body;
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    if (question.isLocked) {
      return res.status(403).json({
        success: false,
        message: 'This question is locked and cannot accept new answers'
      });
    }

    question.answers.push({
      user: req.user._id,
      content
    });

    question.lastActivityAt = new Date();
    await question.save();

    const populatedQuestion = await Question.findById(question._id)
      .populate('answers.user', 'name avatar');

    const newAnswer = populatedQuestion.answers[populatedQuestion.answers.length - 1];

    res.status(201).json({
      success: true,
      data: newAnswer
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to add answer',
      error: error.message
    });
  }
});

router.post('/:id/answers/:answerId/accept', protect, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    if (question.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the question author can accept answers'
      });
    }

    question.markAsSolved(req.params.answerId);
    await question.save();

    const populatedQuestion = await Question.findById(question._id)
      .populate('answers.user', 'name avatar');

    res.json({
      success: true,
      data: populatedQuestion
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

router.post('/:id/answers/:answerId/upvote', protect, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    const answer = question.answers.id(req.params.answerId);
    if (!answer) {
      return res.status(404).json({
        success: false,
        message: 'Answer not found'
      });
    }

    answer.addUpvote(req.user._id);
    question.lastActivityAt = new Date();
    await question.save();

    res.json({
      success: true,
      data: {
        upvotes: answer.upvotes.length,
        downvotes: answer.downvotes.length,
        voteScore: answer.upvotes.length - answer.downvotes.length
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

router.post('/:id/answers/:answerId/downvote', protect, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    const answer = question.answers.id(req.params.answerId);
    if (!answer) {
      return res.status(404).json({
        success: false,
        message: 'Answer not found'
      });
    }

    answer.addDownvote(req.user._id);
    question.lastActivityAt = new Date();
    await question.save();

    res.json({
      success: true,
      data: {
        upvotes: answer.upvotes.length,
        downvotes: answer.downvotes.length,
        voteScore: answer.upvotes.length - answer.downvotes.length
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

router.post('/:id/answers/:answerId/comments', protect, async (req, res) => {
  try {
    const { content } = req.body;
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    const answer = question.answers.id(req.params.answerId);
    if (!answer) {
      return res.status(404).json({
        success: false,
        message: 'Answer not found'
      });
    }

    answer.comments.push({
      user: req.user._id,
      content
    });

    question.lastActivityAt = new Date();
    await question.save();

    const populatedQuestion = await Question.findById(question._id)
      .populate('answers.comments.user', 'name avatar');

    const updatedAnswer = populatedQuestion.answers.id(req.params.answerId);
    const newComment = updatedAnswer.comments[updatedAnswer.comments.length - 1];

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

module.exports = router;

