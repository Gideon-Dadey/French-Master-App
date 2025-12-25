const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  lesson: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson',
    required: true
  },
  watchedDuration: {
    type: Number,
    default: 0
  },
  totalDuration: {
    type: Number,
    required: true
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  completedAt: Date,
  quizScore: {
    score: Number,
    totalPoints: Number,
    passed: Boolean,
    submittedAt: Date
  },
  assignment: {
    submitted: Boolean,
    submittedAt: Date,
    score: Number,
    feedback: String
  },
  lastWatchedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

progressSchema.index({ user: 1, course: 1 });
progressSchema.index({ user: 1, lesson: 1 });

module.exports = mongoose.model('Progress', progressSchema);

