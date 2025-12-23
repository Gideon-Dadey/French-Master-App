const mongoose = require('mongoose');

const quizAttemptSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
  lesson: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  answers: [{
    questionId: mongoose.Schema.Types.ObjectId,
    answer: mongoose.Schema.Types.Mixed, // Can be string, number, or array
    isCorrect: Boolean,
    points: Number,
    timeSpent: Number // in seconds
  }],
  score: {
    type: Number,
    default: 0,
    min: 0
  },
  percentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  passed: {
    type: Boolean,
    default: false
  },
  timeSpent: {
    type: Number, // in seconds
    default: 0
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: Date,
  attemptNumber: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true
});

quizAttemptSchema.index({ user: 1, quiz: 1 });
quizAttemptSchema.index({ quiz: 1, createdAt: -1 });

module.exports = mongoose.model('QuizAttempt', quizAttemptSchema);

