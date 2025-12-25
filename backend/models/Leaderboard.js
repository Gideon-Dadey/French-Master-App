const mongoose = require('mongoose');

const leaderboardEntrySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },

  totalXP: {
    type: Number,
    default: 0
  },
  totalPoints: {
    type: Number,
    default: 0
  },
  level: {
    type: Number,
    default: 1
  },
  currentStreak: {
    type: Number,
    default: 0
  },
  longestStreak: {
    type: Number,
    default: 0
  },

  weeklyXP: {
    type: Number,
    default: 0
  },
  weeklyPoints: {
    type: Number,
    default: 0
  },
  monthlyXP: {
    type: Number,
    default: 0
  },
  monthlyPoints: {
    type: Number,
    default: 0
  },

  coursesCompleted: {
    type: Number,
    default: 0
  },
  lessonsCompleted: {
    type: Number,
    default: 0
  },
  quizzesPassed: {
    type: Number,
    default: 0
  },
  perfectQuizzes: {
    type: Number,
    default: 0
  },
  achievementsUnlocked: {
    type: Number,
    default: 0
  },

  overallRank: {
    type: Number,
    default: 0
  },
  weeklyRank: {
    type: Number,
    default: 0
  },
  monthlyRank: {
    type: Number,
    default: 0
  },

  lastActivityAt: {
    type: Date,
    default: Date.now
  },

  weekStartDate: {
    type: Date,
    default: Date.now
  },
  monthStartDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

leaderboardEntrySchema.index({ totalXP: -1 });
leaderboardEntrySchema.index({ totalPoints: -1 });
leaderboardEntrySchema.index({ weeklyXP: -1 });
leaderboardEntrySchema.index({ monthlyXP: -1 });
leaderboardEntrySchema.index({ currentStreak: -1 });
leaderboardEntrySchema.index({ level: -1 });
leaderboardEntrySchema.index({ user: 1 });

leaderboardEntrySchema.methods.resetWeeklyStats = function() {
  const now = new Date();
  const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
  weekStart.setHours(0, 0, 0, 0);

  if (this.weekStartDate < weekStart) {
    this.weeklyXP = 0;
    this.weeklyPoints = 0;
    this.weekStartDate = weekStart;
    return true;
  }
  return false;
};

leaderboardEntrySchema.methods.resetMonthlyStats = function() {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  if (this.monthStartDate < monthStart) {
    this.monthlyXP = 0;
    this.monthlyPoints = 0;
    this.monthStartDate = monthStart;
    return true;
  }
  return false;
};

leaderboardEntrySchema.methods.addXP = function(amount) {
  this.totalXP += amount;
  this.weeklyXP += amount;
  this.monthlyXP += amount;
  this.level = this.calculateLevel(this.totalXP);
  this.lastActivityAt = new Date();
};

leaderboardEntrySchema.methods.addPoints = function(amount) {
  this.totalPoints += amount;
  this.weeklyPoints += amount;
  this.monthlyPoints += amount;
  this.lastActivityAt = new Date();
};

leaderboardEntrySchema.methods.updateStreak = function(days) {
  this.currentStreak = days;
  if (days > this.longestStreak) {
    this.longestStreak = days;
  }
  this.lastActivityAt = new Date();
};

leaderboardEntrySchema.methods.calculateLevel = function(xp) {
  return Math.floor(Math.sqrt(xp / 100)) + 1;
};

leaderboardEntrySchema.statics.getOrCreateEntry = async function(userId) {
  let entry = await this.findOne({ user: userId });

  if (!entry) {
    entry = new this({ user: userId });
    await entry.save();
  }

  entry.resetWeeklyStats();
  entry.resetMonthlyStats();

  return entry;
};

leaderboardEntrySchema.statics.updateRankings = async function() {

  const overallEntries = await this.find().sort({ totalXP: -1 }).exec();
  for (let i = 0; i < overallEntries.length; i++) {
    overallEntries[i].overallRank = i + 1;
    await overallEntries[i].save();
  }

  const weeklyEntries = await this.find().sort({ weeklyXP: -1 }).exec();
  for (let i = 0; i < weeklyEntries.length; i++) {
    weeklyEntries[i].weeklyRank = i + 1;
    await weeklyEntries[i].save();
  }

  const monthlyEntries = await this.find().sort({ monthlyXP: -1 }).exec();
  for (let i = 0; i < monthlyEntries.length; i++) {
    monthlyEntries[i].monthlyRank = i + 1;
    await monthlyEntries[i].save();
  }
};

module.exports = mongoose.model('Leaderboard', leaderboardEntrySchema);

