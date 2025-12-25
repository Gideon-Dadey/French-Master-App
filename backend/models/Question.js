const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: [true, 'Answer content is required'],
    trim: true
  },
  isAccepted: {
    type: Boolean,
    default: false
  },
  upvotes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  downvotes: [{
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
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

const questionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Question title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Question content is required'],
    trim: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    enum: ['grammar', 'vocabulary', 'pronunciation', 'culture', 'general', 'exam-prep', 'resources', 'other'],
    default: 'general'
  },
  tags: [{
    type: String,
    trim: true
  }],
  answers: [answerSchema],
  views: {
    type: Number,
    default: 0
  },
  upvotes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  downvotes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  isSolved: {
    type: Boolean,
    default: false
  },
  solvedAt: Date,
  isPinned: {
    type: Boolean,
    default: false
  },
  isLocked: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['open', 'closed', 'duplicate'],
    default: 'open'
  },
  relatedCourse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  relatedLesson: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson'
  },
  lastActivityAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

questionSchema.virtual('answerCount').get(function() {
  return this.answers.length;
});

questionSchema.virtual('voteScore').get(function() {
  return this.upvotes.length - this.downvotes.length;
});

questionSchema.methods.hasUpvoted = function(userId) {
  return this.upvotes.some(vote => vote.user.toString() === userId.toString());
};

questionSchema.methods.hasDownvoted = function(userId) {
  return this.downvotes.some(vote => vote.user.toString() === userId.toString());
};

questionSchema.methods.addUpvote = function(userId) {
  if (this.hasUpvoted(userId)) {
    this.upvotes = this.upvotes.filter(vote => vote.user.toString() !== userId.toString());
  } else {

    this.downvotes = this.downvotes.filter(vote => vote.user.toString() !== userId.toString());
    this.upvotes.push({ user: userId });
  }
  this.lastActivityAt = new Date();
  return this;
};

questionSchema.methods.addDownvote = function(userId) {
  if (this.hasDownvoted(userId)) {
    this.downvotes = this.downvotes.filter(vote => vote.user.toString() !== userId.toString());
  } else {

    this.upvotes = this.upvotes.filter(vote => vote.user.toString() !== userId.toString());
    this.downvotes.push({ user: userId });
  }
  this.lastActivityAt = new Date();
  return this;
};

questionSchema.methods.incrementViews = function() {
  this.views += 1;
  return this;
};

questionSchema.methods.markAsSolved = function(answerId) {
  this.isSolved = true;
  this.solvedAt = new Date();
  this.status = 'closed';

  const answer = this.answers.id(answerId);
  if (answer) {
    answer.isAccepted = true;
  }
  this.lastActivityAt = new Date();
  return this;
};

questionSchema.index({ author: 1 });
questionSchema.index({ category: 1 });
questionSchema.index({ status: 1 });
questionSchema.index({ isSolved: 1 });
questionSchema.index({ isPinned: 1 });
questionSchema.index({ createdAt: -1 });
questionSchema.index({ lastActivityAt: -1 });
questionSchema.index({ views: -1 });
questionSchema.index({ tags: 1 });
questionSchema.index({ title: 'text', content: 'text' });

answerSchema.methods.hasUpvoted = function(userId) {
  return this.upvotes.some(vote => vote.user.toString() === userId.toString());
};

answerSchema.methods.hasDownvoted = function(userId) {
  return this.downvotes.some(vote => vote.user.toString() === userId.toString());
};

answerSchema.methods.addUpvote = function(userId) {
  if (this.hasUpvoted(userId)) {
    this.upvotes = this.upvotes.filter(vote => vote.user.toString() !== userId.toString());
  } else {
    this.downvotes = this.downvotes.filter(vote => vote.user.toString() !== userId.toString());
    this.upvotes.push({ user: userId });
  }
  return this;
};

answerSchema.methods.addDownvote = function(userId) {
  if (this.hasDownvoted(userId)) {
    this.downvotes = this.downvotes.filter(vote => vote.user.toString() !== userId.toString());
  } else {
    this.upvotes = this.upvotes.filter(vote => vote.user.toString() !== userId.toString());
    this.downvotes.push({ user: userId });
  }
  return this;
};

module.exports = mongoose.model('Question', questionSchema);

