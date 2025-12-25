const express = require('express');
const router = express.Router();
const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const { protect, authorize } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const { lesson, course, status } = req.query;
    const query = {};

    if (lesson) query.lesson = lesson;
    if (course) query.course = course;
    if (status) query.status = status;

    const quizzes = await Quiz.find(query)
      .populate('lesson', 'title')
      .populate('course', 'title')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: quizzes.length,
      data: quizzes
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
    const quiz = await Quiz.findById(req.params.id)
      .populate('lesson', 'title')
      .populate('course', 'title');

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    res.json({
      success: true,
      data: quiz
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

router.post('/', protect, authorize('instructor', 'admin'), async (req, res) => {
  try {
    const quiz = await Quiz.create({
      ...req.body,
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      data: quiz
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to create quiz',
      error: error.message
    });
  }
});

router.put('/:id', protect, authorize('instructor', 'admin'), async (req, res) => {
  try {
    const quiz = await Quiz.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    res.json({
      success: true,
      data: quiz
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to update quiz',
      error: error.message
    });
  }
});

router.delete('/:id', protect, authorize('instructor', 'admin'), async (req, res) => {
  try {
    const quiz = await Quiz.findByIdAndDelete(req.params.id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    res.json({
      success: true,
      message: 'Quiz deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

router.post('/:id/attempt', protect, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    const attempts = await QuizAttempt.countDocuments({
      user: req.user.id,
      quiz: quiz._id
    });

    if (attempts >= quiz.maxAttempts) {
      return res.status(400).json({
        success: false,
        message: 'Maximum attempts reached'
      });
    }

    let score = 0;
    let totalPoints = 0;
    const answers = req.body.answers || [];

    quiz.questions.forEach((question, index) => {
      totalPoints += question.points;
      const userAnswer = answers[index];

      if (question.type === 'multiple_choice' || question.type === 'single_choice') {
        const selectedOptions = Array.isArray(userAnswer) ? userAnswer : [userAnswer];
        const correctOptions = question.options
          .map((opt, idx) => opt.isCorrect ? idx : null)
          .filter(idx => idx !== null);

        if (JSON.stringify(selectedOptions.sort()) === JSON.stringify(correctOptions.sort())) {
          score += question.points;
        }
      } else if (question.type === 'short_answer') {
        if (userAnswer && userAnswer.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim()) {
          score += question.points;
        }
      }
    });

    const percentage = totalPoints > 0 ? (score / totalPoints) * 100 : 0;
    const passed = percentage >= quiz.passingScore;

    const attempt = await QuizAttempt.create({
      user: req.user.id,
      quiz: quiz._id,
      lesson: quiz.lesson,
      course: quiz.course,
      answers: answers.map((answer, index) => ({
        questionId: quiz.questions[index]._id,
        answer: answer,
        isCorrect: false,
        points: 0
      })),
      score,
      percentage,
      passed,
      timeSpent: req.body.timeSpent || 0,
      attemptNumber: attempts + 1,
      completedAt: new Date()
    });

    res.status(201).json({
      success: true,
      data: attempt
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to submit quiz',
      error: error.message
    });
  }
});

router.get('/:id/attempts', protect, async (req, res) => {
  try {
    const attempts = await QuizAttempt.find({
      user: req.user.id,
      quiz: req.params.id
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: attempts.length,
      data: attempts
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

