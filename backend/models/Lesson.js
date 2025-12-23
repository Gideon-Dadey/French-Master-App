const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Lesson title is required'],
    trim: true
  },
  description: {
    type: String
  },
  order: {
    type: Number,
    required: true
  },
  videoUrl: {
    type: String,
    required: true
  },
  videoDuration: {
    type: Number, // in seconds
    default: 0
  },
  thumbnail: {
    type: String
  },
  resources: [{
    type: {
      type: String,
      enum: ['pdf', 'document', 'link', 'audio']
    },
    title: String,
    url: String,
    fileSize: Number
  }],
  quiz: {
    enabled: {
      type: Boolean,
      default: false
    },
    questions: [{
      question: String,
      options: [String],
      correctAnswer: Number,
      points: {
        type: Number,
        default: 1
      }
    }],
    passingScore: {
      type: Number,
      default: 70
    }
  },
  assignment: {
    enabled: {
      type: Boolean,
      default: false
    },
    instructions: String,
    dueDate: Date,
    maxScore: Number
  },
  isPreview: {
    type: Boolean,
    default: false
  },
  isDownloadable: {
    type: Boolean,
    default: false
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

lessonSchema.index({ course: 1, order: 1 });

module.exports = mongoose.model('Lesson', lessonSchema);

