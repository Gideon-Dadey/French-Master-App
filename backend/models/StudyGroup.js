const mongoose = require('mongoose');

const studyGroupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a group name'],
    trim: true,
    maxlength: [100, 'Group name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    role: {
      type: String,
      enum: ['member', 'moderator'],
      default: 'member'
    }
  }],
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'all'],
    default: 'all'
  },
  focus: {
    type: String,
    enum: ['grammar', 'vocabulary', 'conversation', 'pronunciation', 'writing', 'reading', 'general', 'exam-prep'],
    default: 'general'
  },
  maxMembers: {
    type: Number,
    default: 20,
    min: [2, 'Minimum 2 members required'],
    max: [100, 'Maximum 100 members allowed']
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  inviteCode: {
    type: String,
    unique: true,
    sparse: true
  },
  meetingSchedule: {
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'bi-weekly', 'monthly', 'flexible'],
      default: 'flexible'
    },
    dayOfWeek: {
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    },
    time: String,
    timezone: {
      type: String,
      default: 'UTC'
    }
  },
  studyGoals: [{
    type: String,
    trim: true
  }],
  resources: [{
    title: String,
    url: String,
    type: {
      type: String,
      enum: ['link', 'document', 'video', 'other']
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  discussions: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    message: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: ['active', 'archived', 'closed'],
    default: 'active'
  },
  tags: [{
    type: String,
    trim: true
  }],
  image: {
    type: String,
    default: ''
  },
  stats: {
    totalSessions: {
      type: Number,
      default: 0
    },
    activeMembers: {
      type: Number,
      default: 0
    },
    lastActivity: {
      type: Date,
      default: Date.now
    }
  }
}, {
  timestamps: true
});

// Generate unique invite code
studyGroupSchema.methods.generateInviteCode = function() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  this.inviteCode = code;
  return code;
};

// Check if user is a member
studyGroupSchema.methods.isMember = function(userId) {
  return this.members.some(member => member.user.toString() === userId.toString());
};

// Check if user is creator or moderator
studyGroupSchema.methods.isModerator = function(userId) {
  return this.creator.toString() === userId.toString() ||
         this.members.some(member => 
           member.user.toString() === userId.toString() && member.role === 'moderator'
         );
};

// Add member to group
studyGroupSchema.methods.addMember = function(userId, role = 'member') {
  if (this.members.length >= this.maxMembers) {
    throw new Error('Group has reached maximum capacity');
  }
  
  if (this.isMember(userId)) {
    throw new Error('User is already a member');
  }

  this.members.push({
    user: userId,
    role,
    joinedAt: new Date()
  });

  this.stats.activeMembers = this.members.length;
  this.stats.lastActivity = new Date();
  
  return this;
};

// Remove member from group
studyGroupSchema.methods.removeMember = function(userId) {
  if (this.creator.toString() === userId.toString()) {
    throw new Error('Creator cannot be removed from group');
  }

  this.members = this.members.filter(
    member => member.user.toString() !== userId.toString()
  );

  this.stats.activeMembers = this.members.length;
  this.stats.lastActivity = new Date();
  
  return this;
};

// Indexes for better query performance
studyGroupSchema.index({ creator: 1 });
studyGroupSchema.index({ 'members.user': 1 });
studyGroupSchema.index({ level: 1, focus: 1 });
studyGroupSchema.index({ status: 1 });
studyGroupSchema.index({ inviteCode: 1 });
studyGroupSchema.index({ createdAt: -1 });

module.exports = mongoose.model('StudyGroup', studyGroupSchema);

