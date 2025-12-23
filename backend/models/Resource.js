const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Resource title is required'],
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    enum: ['study-guides', 'practice-tests', 'vocabulary', 'grammar', 'audio', 'videos'],
    required: [true, 'Resource category is required']
  },
  type: {
    type: String,
    enum: ['PDF', 'MP3', 'MP4', 'DOCX', 'ZIP'],
    required: true
  },
  fileUrl: {
    type: String,
    required: [true, 'File URL is required']
  },
  thumbnail: {
    type: String,
    default: ''
  },
  size: {
    type: Number, // in bytes
    default: 0
  },
  sizeFormatted: {
    type: String, // e.g., "2.5 MB"
    default: '0 MB'
  },
  downloads: {
    type: Number,
    default: 0
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  isFree: {
    type: Boolean,
    default: true
  },
  language: {
    type: String,
    enum: ['french', 'english', 'both'],
    default: 'french'
  },
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'all-levels'],
    default: 'all-levels'
  },
  tags: [String],
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'published'
  },
  featured: {
    type: Boolean,
    default: false
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
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

// Indexes for better query performance
resourceSchema.index({ category: 1, status: 1 });
resourceSchema.index({ language: 1, level: 1 });
resourceSchema.index({ downloads: -1 });
resourceSchema.index({ 'rating.average': -1 });
resourceSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Resource', resourceSchema);

