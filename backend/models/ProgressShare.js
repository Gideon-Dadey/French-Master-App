const mongoose = require('mongoose');

const progressShareSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['course-completed', 'achievement', 'milestone', 'streak', 'certificate', 'custom'],
    required: true
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },

  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  achievement: {
    id: String,
    name: String,
    icon: String,
    description: String
  },
  milestone: {
    type: String,
    enum: ['first-course', 'first-lesson', 'week-streak', 'month-streak', 'level-up', 'perfect-quiz', 'other']
  },
  streak: {
    days: Number,
    type: String
  },
  certificate: {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course'
    },
    certificateId: String,
    issuedAt: Date
  },
  stats: {
    level: Number,
    totalXP: Number,
    coursesCompleted: Number,
    lessonsCompleted: Number,
    currentStreak: Number
  },
  image: {
    type: String,
    default: ''
  },

  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: [500, 'Comment cannot exceed 500 characters']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  shares: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

progressShareSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

progressShareSchema.virtual('commentCount').get(function() {
  return this.comments.length;
});

progressShareSchema.methods.hasLiked = function(userId) {
  return this.likes.some(like => like.user.toString() === userId.toString());
};

progressShareSchema.methods.toggleLike = function(userId) {
  const likeIndex = this.likes.findIndex(like => like.user.toString() === userId.toString());

  if (likeIndex > -1) {
    this.likes.splice(likeIndex, 1);
  } else {
    this.likes.push({ user: userId });
  }

  return this;
};

progressShareSchema.methods.addComment = function(userId, content) {
  this.comments.push({
    user: userId,
    content: content.trim()
  });
  return this;
};

progressShareSchema.methods.incrementViews = function() {
  this.views += 1;
  return this;
};

progressShareSchema.methods.incrementShares = function() {
  this.shares += 1;
  return this;
};

progressShareSchema.index({ user: 1 });
progressShareSchema.index({ type: 1 });
progressShareSchema.index({ course: 1 });
progressShareSchema.index({ createdAt: -1 });
progressShareSchema.index({ 'likes.user': 1 });
progressShareSchema.index({ isPublic: 1 });
progressShareSchema.index({ tags: 1 });

module.exports = mongoose.model('ProgressShare', progressShareSchema);

