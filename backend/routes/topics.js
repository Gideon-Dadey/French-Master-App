const express = require('express');
const router = express.Router();
const Discussion = require('../models/Discussion');
const Question = require('../models/Question');
const Blog = require('../models/Blog');
const Course = require('../models/Course');

router.get('/', async (req, res) => {
  try {
    const topics = [
      { id: 'grammar', name: 'Grammar', icon: 'school-outline', color: '#10B981' },
      { id: 'vocabulary', name: 'Vocabulary', icon: 'book-outline', color: '#F59E0B' },
      { id: 'pronunciation', name: 'Pronunciation', icon: 'mic-outline', color: '#EF4444' },
      { id: 'culture', name: 'Culture', icon: 'globe-outline', color: '#3B82F6' },
      { id: 'general', name: 'General', icon: 'chatbubbles-outline', color: '#9C27B0' },
      { id: 'tips', name: 'Tips', icon: 'bulb-outline', color: '#F59E0B' },
      { id: 'resources', name: 'Resources', icon: 'folder-outline', color: '#9C27B0' },
      { id: 'exam-prep', name: 'Exam Prep', icon: 'document-text-outline', color: '#6366F1' },
    ];

    const topicsWithCounts = await Promise.all(
      topics.map(async (topic) => {
        const [discussions, questions, blogs, courses] = await Promise.all([
          Discussion.countDocuments({ category: topic.id, isPinned: { $ne: true } }),
          Question.countDocuments({ category: topic.id, status: 'open' }),
          Blog.countDocuments({ category: topic.id, status: 'published' }),
          Course.countDocuments({ category: topic.id, status: 'published' }),
        ]);

        const recentDiscussions = await Discussion.find({ category: topic.id })
          .sort({ lastActivityAt: -1 })
          .limit(1)
          .select('lastActivityAt');

        return {
          ...topic,
          counts: {
            discussions,
            questions,
            blogs,
            courses,
            total: discussions + questions + blogs + courses,
          },
          lastActivity: recentDiscussions[0]?.lastActivityAt || null,
        };
      })
    );

    topicsWithCounts.sort((a, b) => b.counts.total - a.counts.total);

    res.json({
      success: true,
      count: topicsWithCounts.length,
      data: topicsWithCounts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
});

router.get('/:topicId', async (req, res) => {
  try {
    const { topicId } = req.params;
    const { type, limit = 10, page = 1 } = req.query;

    const skip = (page - 1) * limit;

    const topic = {
      grammar: { id: 'grammar', name: 'Grammar', icon: 'school-outline', color: '#10B981' },
      vocabulary: { id: 'vocabulary', name: 'Vocabulary', icon: 'book-outline', color: '#F59E0B' },
      pronunciation: { id: 'pronunciation', name: 'Pronunciation', icon: 'mic-outline', color: '#EF4444' },
      culture: { id: 'culture', name: 'Culture', icon: 'globe-outline', color: '#3B82F6' },
      general: { id: 'general', name: 'General', icon: 'chatbubbles-outline', color: '#9C27B0' },
      tips: { id: 'tips', name: 'Tips', icon: 'bulb-outline', color: '#F59E0B' },
      resources: { id: 'resources', name: 'Resources', icon: 'folder-outline', color: '#9C27B0' },
      'exam-prep': { id: 'exam-prep', name: 'Exam Prep', icon: 'document-text-outline', color: '#6366F1' },
    }[topicId];

    if (!topic) {
      return res.status(404).json({
        success: false,
        message: 'Topic not found',
      });
    }

    let content = [];
    let total = 0;

    if (!type || type === 'all') {

      const [discussions, questions, blogs, courses] = await Promise.all([
        Discussion.find({ category: topicId })
          .populate('author', 'name avatar')
          .sort({ lastActivityAt: -1 })
          .skip(skip)
          .limit(Math.ceil(limit / 4))
          .select('title content author views likes replies createdAt'),
        Question.find({ category: topicId, status: 'open' })
          .populate('author', 'name avatar')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(Math.ceil(limit / 4))
          .select('title content author views upvotes answers createdAt'),
        Blog.find({ category: topicId, status: 'published' })
          .populate('author', 'name avatar')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(Math.ceil(limit / 4))
          .select('title excerpt author views createdAt'),
        Course.find({ category: topicId, status: 'published' })
          .populate('instructor', 'name avatar')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(Math.ceil(limit / 4))
          .select('title description instructor price rating studentsEnrolled createdAt'),
      ]);

      content = [
        ...discussions.map((d) => ({ type: 'discussion', data: d })),
        ...questions.map((q) => ({ type: 'question', data: q })),
        ...blogs.map((b) => ({ type: 'blog', data: b })),
        ...courses.map((c) => ({ type: 'course', data: c })),
      ].sort((a, b) => new Date(b.data.createdAt) - new Date(a.data.createdAt));

      const [discussionsCount, questionsCount, blogsCount, coursesCount] = await Promise.all([
        Discussion.countDocuments({ category: topicId }),
        Question.countDocuments({ category: topicId, status: 'open' }),
        Blog.countDocuments({ category: topicId, status: 'published' }),
        Course.countDocuments({ category: topicId, status: 'published' }),
      ]);

      total = discussionsCount + questionsCount + blogsCount + coursesCount;
    } else {

      let query = { category: topicId };
      if (type === 'discussions') {
        const discussions = await Discussion.find(query)
          .populate('author', 'name avatar')
          .sort({ lastActivityAt: -1 })
          .skip(skip)
          .limit(Number(limit))
          .select('title content author views likes replies createdAt');
        content = discussions.map((d) => ({ type: 'discussion', data: d }));
        total = await Discussion.countDocuments(query);
      } else if (type === 'questions') {
        query.status = 'open';
        const questions = await Question.find(query)
          .populate('author', 'name avatar')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(Number(limit))
          .select('title content author views upvotes answers createdAt');
        content = questions.map((q) => ({ type: 'question', data: q }));
        total = await Question.countDocuments(query);
      } else if (type === 'blogs') {
        query.status = 'published';
        const blogs = await Blog.find(query)
          .populate('author', 'name avatar')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(Number(limit))
          .select('title excerpt author views createdAt');
        content = blogs.map((b) => ({ type: 'blog', data: b }));
        total = await Blog.countDocuments(query);
      } else if (type === 'courses') {
        query.status = 'published';
        const courses = await Course.find(query)
          .populate('instructor', 'name avatar')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(Number(limit))
          .select('title description instructor price rating studentsEnrolled createdAt');
        content = courses.map((c) => ({ type: 'course', data: c }));
        total = await Course.countDocuments(query);
      }
    }

    res.json({
      success: true,
      topic,
      count: content.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      data: content,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
});

module.exports = router;

