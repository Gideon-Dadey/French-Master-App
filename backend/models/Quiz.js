const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
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
  title: {
    type: String,
    required: [true, 'Quiz title is required'],
    trim: true
  },
  description: {
    type: String
  },
  questions: [{
    question: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['multiple_choice', 'single_choice', 'true_false', 'short_answer'],
      default: 'multiple_choice'
    },
    options: [{
      text: String,
      isCorrect: {
        type: Boolean,
        default: false
      }
    }],
    correctAnswer: String, // For short answer questions
    points: {
      type: Number,
      default: 1
    },
    explanation: String,
    order: {
      type: Number,
      default: 0
    }
  }],
  timeLimit: {
    type: Number, // in minutes
    default: 0 // 0 means no time limit
  },
  passingScore: {
    type: Number,
    default: 70, // percentage
    min: 0,
    max: 100
  },
  maxAttempts: {
    type: Number,
    default: 3,
    min: 1
  },
  showResults: {
    type: Boolean,
    default: true
  },
  randomizeQuestions: {
    type: Boolean,
    default: false
  },
  randomizeOptions: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

quizSchema.index({ lesson: 1, course: 1 });
quizSchema.index({ status: 1 });

module.exports = mongoose.model('Quiz', quizSchema);

