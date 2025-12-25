const express = require('express');
const router = express.Router();
const Leaderboard = require('../models/Leaderboard');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const {
      type = 'overall',
      limit = 50,
      page = 1,
      courseId
    } = req.query;

    const skip = (page - 1) * limit;
    let sortOption = {};
    let selectFields = 'user totalXP totalPoints level currentStreak longestStreak coursesCompleted lessonsCompleted achievementsUnlocked overallRank weeklyRank monthlyRank lastActivityAt';

    switch (type) {
      case 'weekly':
        sortOption = { weeklyXP: -1, weeklyPoints: -1 };
        selectFields += ' weeklyXP weeklyPoints weeklyRank';
        break;
      case 'monthly':
        sortOption = { monthlyXP: -1, monthlyPoints: -1 };
        selectFields += ' monthlyXP monthlyPoints monthlyRank';
        break;
      case 'streak':
        sortOption = { currentStreak: -1, longestStreak: -1 };
        break;
      case 'level':
        sortOption = { level: -1, totalXP: -1 };
        break;
      case 'courses':
        sortOption = { coursesCompleted: -1, lessonsCompleted: -1 };
        break;
      case 'achievements':
        sortOption = { achievementsUnlocked: -1, totalXP: -1 };
        break;
      default:
        sortOption = { totalXP: -1, totalPoints: -1 };
        selectFields += ' overallRank';
    }

    const entries = await Leaderboard.find()
      .select(selectFields)
      .populate('user', 'name avatar email')
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit));

    const total = await Leaderboard.countDocuments();

    let userRank = null;
    let userEntry = null;
    if (req.user) {
      userEntry = await Leaderboard.findOne({ user: req.user._id })
        .populate('user', 'name avatar email');

      if (userEntry) {
        let rankField = 'overallRank';
        if (type === 'weekly') rankField = 'weeklyRank';
        if (type === 'monthly') rankField = 'monthlyRank';

        if (userEntry[rankField]) {
          userRank = userEntry[rankField];
        } else {

          const rankQuery = {};
          if (type === 'weekly') {
            rankQuery.weeklyXP = { $gt: userEntry.weeklyXP };
          } else if (type === 'monthly') {
            rankQuery.monthlyXP = { $gt: userEntry.monthlyXP };
          } else {
            rankQuery.totalXP = { $gt: userEntry.totalXP };
          }
          const usersAbove = await Leaderboard.countDocuments(rankQuery);
          userRank = usersAbove + 1;
        }
      }
    }

    res.json({
      success: true,
      type,
      count: entries.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      data: entries,
      userRank,
      userEntry: userEntry ? {
        ...userEntry.toObject(),
        rank: userRank
      } : null
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

router.get('/me', protect, async (req, res) => {
  try {
    const entry = await Leaderboard.findOne({ user: req.user._id })
      .populate('user', 'name avatar email');

    if (!entry) {

      const newEntry = await Leaderboard.getOrCreateEntry(req.user._id);
      const populated = await Leaderboard.findById(newEntry._id)
        .populate('user', 'name avatar email');

      return res.json({
        success: true,
        data: populated
      });
    }

    const overallRank = await Leaderboard.countDocuments({ totalXP: { $gt: entry.totalXP } }) + 1;
    const weeklyRank = await Leaderboard.countDocuments({ weeklyXP: { $gt: entry.weeklyXP } }) + 1;
    const monthlyRank = await Leaderboard.countDocuments({ monthlyXP: { $gt: entry.monthlyXP } }) + 1;

    res.json({
      success: true,
      data: {
        ...entry.toObject(),
        ranks: {
          overall: overallRank,
          weekly: weeklyRank,
          monthly: monthlyRank
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

router.get('/around-me', protect, async (req, res) => {
  try {
    const { type = 'overall', range = 5 } = req.query;

    const userEntry = await Leaderboard.findOne({ user: req.user._id });

    if (!userEntry) {
      return res.json({
        success: true,
        data: [],
        userRank: null,
        userEntry: null
      });
    }

    let sortOption = {};
    let userValue = 0;

    switch (type) {
      case 'weekly':
        sortOption = { weeklyXP: -1 };
        userValue = userEntry.weeklyXP;
        break;
      case 'monthly':
        sortOption = { monthlyXP: -1 };
        userValue = userEntry.monthlyXP;
        break;
      default:
        sortOption = { totalXP: -1 };
        userValue = userEntry.totalXP;
    }

    const above = await Leaderboard.find(
      type === 'weekly'
        ? { weeklyXP: { $gt: userValue } }
        : type === 'monthly'
        ? { monthlyXP: { $gt: userValue } }
        : { totalXP: { $gt: userValue } }
    )
      .populate('user', 'name avatar email')
      .sort(sortOption)
      .limit(Number(range));

    const below = await Leaderboard.find(
      type === 'weekly'
        ? { weeklyXP: { $lt: userValue } }
        : type === 'monthly'
        ? { monthlyXP: { $lt: userValue } }
        : { totalXP: { $lt: userValue } }
    )
      .populate('user', 'name avatar email')
      .sort(type === 'weekly' ? { weeklyXP: -1 } : type === 'monthly' ? { monthlyXP: -1 } : { totalXP: -1 })
      .limit(Number(range));

    const userRank = await Leaderboard.countDocuments(
      type === 'weekly'
        ? { weeklyXP: { $gt: userValue } }
        : type === 'monthly'
        ? { monthlyXP: { $gt: userValue } }
        : { totalXP: { $gt: userValue } }
    ) + 1;

    const userEntryPopulated = await Leaderboard.findById(userEntry._id)
      .populate('user', 'name avatar email');

    res.json({
      success: true,
      data: {
        above: above.reverse(),
        user: userEntryPopulated,
        below
      },
      userRank
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

router.post('/update-stats', protect, async (req, res) => {
  try {
    const {
      xp,
      points,
      streak,
      courseCompleted,
      lessonCompleted,
      quizPassed,
      perfectQuiz,
      achievementUnlocked
    } = req.body;

    const entry = await Leaderboard.getOrCreateEntry(req.user._id);

    if (xp) entry.addXP(xp);
    if (points) entry.addPoints(points);
    if (streak !== undefined) entry.updateStreak(streak);
    if (courseCompleted) {
      entry.coursesCompleted += 1;
      entry.lastActivityAt = new Date();
    }
    if (lessonCompleted) {
      entry.lessonsCompleted += 1;
      entry.lastActivityAt = new Date();
    }
    if (quizPassed) {
      entry.quizzesPassed += 1;
      entry.lastActivityAt = new Date();
    }
    if (perfectQuiz) {
      entry.perfectQuizzes += 1;
      entry.lastActivityAt = new Date();
    }
    if (achievementUnlocked) {
      entry.achievementsUnlocked += 1;
      entry.lastActivityAt = new Date();
    }

    await entry.save();

    res.json({
      success: true,
      data: entry
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

router.post('/update-rankings', protect, async (req, res) => {
  try {
    await Leaderboard.updateRankings();

    res.json({
      success: true,
      message: 'Rankings updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;

