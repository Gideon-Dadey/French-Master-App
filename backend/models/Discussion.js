const mongoose = require('mongoose');

const discussionReplySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: [true, 'Reply content is required'],
    trim: true,
    maxlength: [2000, 'Reply cannot exceed 2000 characters']
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
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: Date
}, {
  timestamps: true
});

const discussionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Discussion title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Discussion content is required'],
    trim: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    enum: ['general', 'grammar', 'vocabulary', 'pronunciation', 'culture', 'tips', 'resources', 'off-topic'],
    default: 'general'
  },
  tags: [{
    type: String,
    trim: true
  }],
  replies: [discussionReplySchema],
  views: {
    type: Number,
    default: 0
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
  isPinned: {
    type: Boolean,
    default: false
  },
  isLocked: {
    type: Boolean,
    default: false
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: Date,
  lastActivityAt: {
    type: Date,
    default: Date.now
  },
  relatedCourse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  relatedLesson: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson'
  }
}, {
  timestamps: true
});

discussionSchema.virtual('replyCount').get(function() {
  return this.replies.length;
});

discussionSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

discussionSchema.methods.hasLiked = function(userId) {
  return this.likes.some(like => like.user.toString() === userId.toString());
};

discussionSchema.methods.toggleLike = function(userId) {
  const likeIndex = this.likes.findIndex(like => like.user.toString() === userId.toString());

  if (likeIndex > -1) {
    this.likes.splice(likeIndex, 1);
  } else {
    this.likes.push({ user: userId });
  }

  this.lastActivityAt = new Date();
  return this;
};

discussionSchema.methods.addReply = function(userId, content) {
  this.replies.push({
    user: userId,
    content: content.trim()
  });
  this.lastActivityAt = new Date();
  return this;
};

discussionSchema.methods.incrementViews = function() {
  this.views += 1;
  return this;
};

discussionSchema.methods.markAsEdited = function() {
  this.isEdited = true;
  this.editedAt = new Date();
  return this;
};

discussionReplySchema.methods.hasLiked = function(userId) {
  return this.likes.some(like => like.user.toString() === userId.toString());
};

discussionReplySchema.methods.toggleLike = function(userId) {
  const likeIndex = this.likes.findIndex(like => like.user.toString() === userId.toString());

  if (likeIndex > -1) {
    this.likes.splice(likeIndex, 1);
  } else {
    this.likes.push({ user: userId });
  }

  return this;
};

discussionReplySchema.methods.markAsEdited = function() {
  this.isEdited = true;
  this.editedAt = new Date();
  return this;
};

discussionSchema.index({ author: 1 });
discussionSchema.index({ category: 1 });
discussionSchema.index({ isPinned: -1 });
discussionSchema.index({ createdAt: -1 });
discussionSchema.index({ lastActivityAt: -1 });
discussionSchema.index({ views: -1 });
discussionSchema.index({ tags: 1 });
discussionSchema.index({ title: 'text', content: 'text' });

module.exports = mongoose.model('Discussion', discussionSchema);

