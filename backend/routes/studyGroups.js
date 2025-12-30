const express = require('express');
const router = express.Router();
const StudyGroup = require('../models/StudyGroup');
const { protect, optionalAuth } = require('../middleware/auth');

router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      level,
      focus,
      search,
      status = 'active',
      page = 1,
      limit = 10,
      myGroups
    } = req.query;

    const query = { status };

    if (myGroups === 'true' && req.user) {
      query.$or = [
        { creator: req.user._id },
        { 'members.user': req.user._id }
      ];
    } else if (!req.user) {

      query.isPrivate = false;
    }

    if (level && level !== 'all') query.level = level;
    if (focus) query.focus = focus;

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const skip = (page - 1) * limit;

    const studyGroups = await StudyGroup.find(query)
      .populate('creator', 'name avatar')
      .populate('members.user', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await StudyGroup.countDocuments(query);

    res.json({
      success: true,
      count: studyGroups.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      data: studyGroups
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const studyGroup = await StudyGroup.findById(req.params.id)
      .populate('creator', 'name avatar email')
      .populate('members.user', 'name avatar email')
      .populate('resources.addedBy', 'name avatar')
      .populate('discussions.user', 'name avatar');

    if (!studyGroup) {
      return res.status(404).json({
        success: false,
        message: 'Study group not found'
      });
    }

    if (studyGroup.isPrivate && (!req.user || !studyGroup.isMember(req.user._id))) {
      return res.status(403).json({
        success: false,
        message: 'This is a private group. You need to be a member to view it.'
      });
    }

    res.json({
      success: true,
      data: studyGroup
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const {
      name,
      description,
      level,
      focus,
      maxMembers,
      isPrivate,
      meetingSchedule,
      studyGoals,
      tags
    } = req.body;

    let cleanedMeetingSchedule = meetingSchedule || {};
    if (cleanedMeetingSchedule.dayOfWeek === '' || !cleanedMeetingSchedule.dayOfWeek) {
      const { dayOfWeek, ...rest } = cleanedMeetingSchedule;
      cleanedMeetingSchedule = rest;
    }

    if (cleanedMeetingSchedule.time === '') {
      const { time, ...rest } = cleanedMeetingSchedule;
      cleanedMeetingSchedule = rest;
    }

    const studyGroup = new StudyGroup({
      name,
      description,
      creator: req.user._id,
      level: level || 'all',
      focus: focus || 'general',
      maxMembers: maxMembers || 20,
      isPrivate: isPrivate || false,
      meetingSchedule: cleanedMeetingSchedule,
      studyGoals: studyGoals || [],
      tags: tags || []
    });

    studyGroup.addMember(req.user._id, 'member');

    if (isPrivate) {
      studyGroup.generateInviteCode();
    }

    await studyGroup.save();

    const populatedGroup = await StudyGroup.findById(studyGroup._id)
      .populate('creator', 'name avatar')
      .populate('members.user', 'name avatar');

    res.status(201).json({
      success: true,
      data: populatedGroup
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create study group',
      error: error.message
    });
  }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const studyGroup = await StudyGroup.findById(req.params.id);

    if (!studyGroup) {
      return res.status(404).json({
        success: false,
        message: 'Study group not found'
      });
    }

    if (!studyGroup.isModerator(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Only group creator or moderators can update the group'
      });
    }

    const allowedUpdates = [
      'name', 'description', 'level', 'focus', 'maxMembers',
      'isPrivate', 'meetingSchedule', 'studyGoals', 'tags', 'image', 'status'
    ];

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        studyGroup[field] = req.body[field];
      }
    });

    if (req.body.isPrivate && !studyGroup.inviteCode) {
      studyGroup.generateInviteCode();
    }

    studyGroup.stats.lastActivity = new Date();
    await studyGroup.save();

    const populatedGroup = await StudyGroup.findById(studyGroup._id)
      .populate('creator', 'name avatar')
      .populate('members.user', 'name avatar');

    res.json({
      success: true,
      data: populatedGroup
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update study group',
      error: error.message
    });
  }
});

router.post('/:id/join', protect, async (req, res) => {
  try {
    const { inviteCode } = req.body;
    const studyGroup = await StudyGroup.findById(req.params.id);

    if (!studyGroup) {
      return res.status(404).json({
        success: false,
        message: 'Study group not found'
      });
    }

    if (studyGroup.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'This study group is not accepting new members'
      });
    }

    if (studyGroup.isMember(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: 'You are already a member of this group'
      });
    }

    if (studyGroup.isPrivate) {
      if (!inviteCode || inviteCode !== studyGroup.inviteCode) {
        return res.status(403).json({
          success: false,
          message: 'Invalid invite code for private group'
        });
      }
    }

    studyGroup.addMember(req.user._id);
    await studyGroup.save();

    const populatedGroup = await StudyGroup.findById(studyGroup._id)
      .populate('creator', 'name avatar')
      .populate('members.user', 'name avatar');

    res.json({
      success: true,
      message: 'Successfully joined study group',
      data: populatedGroup
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to join study group',
      error: error.message
    });
  }
});

router.post('/:id/leave', protect, async (req, res) => {
  try {
    const studyGroup = await StudyGroup.findById(req.params.id);

    if (!studyGroup) {
      return res.status(404).json({
        success: false,
        message: 'Study group not found'
      });
    }

    if (!studyGroup.isMember(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: 'You are not a member of this group'
      });
    }

    studyGroup.removeMember(req.user._id);
    await studyGroup.save();

    res.json({
      success: true,
      message: 'Successfully left study group'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to leave study group',
      error: error.message
    });
  }
});

router.post('/:id/members/:userId/remove', protect, async (req, res) => {
  try {
    const studyGroup = await StudyGroup.findById(req.params.id);

    if (!studyGroup) {
      return res.status(404).json({
        success: false,
        message: 'Study group not found'
      });
    }

    if (!studyGroup.isModerator(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Only group creator or moderators can remove members'
      });
    }

    studyGroup.removeMember(req.params.userId);
    await studyGroup.save();

    res.json({
      success: true,
      message: 'Member removed successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to remove member',
      error: error.message
    });
  }
});

router.post('/:id/discussions', protect, async (req, res) => {
  try {
    const { message } = req.body;
    const studyGroup = await StudyGroup.findById(req.params.id);

    if (!studyGroup) {
      return res.status(404).json({
        success: false,
        message: 'Study group not found'
      });
    }

    if (!studyGroup.isMember(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'You must be a member to post discussions'
      });
    }

    studyGroup.discussions.push({
      user: req.user._id,
      message,
      createdAt: new Date()
    });

    studyGroup.stats.lastActivity = new Date();
    await studyGroup.save();

    const populatedGroup = await StudyGroup.findById(studyGroup._id)
      .populate('discussions.user', 'name avatar');

    const newMessage = populatedGroup.discussions[populatedGroup.discussions.length - 1];

    // Emit real-time update
    const io = req.app.get('io');
    if (io) {
      io.to(req.params.id).emit('new_message', {
        groupId: req.params.id,
        message: newMessage
      });
    }

    res.json({
      success: true,
      data: newMessage
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to add discussion',
      error: error.message
    });
  }
});

router.delete('/:id/discussions/:messageId', protect, async (req, res) => {
  try {
    const studyGroup = await StudyGroup.findById(req.params.id);

    if (!studyGroup) {
      return res.status(404).json({
        success: false,
        message: 'Study group not found'
      });
    }

    const messageIndex = studyGroup.discussions.findIndex(
      d => d._id.toString() === req.params.messageId
    );

    if (messageIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    const message = studyGroup.discussions[messageIndex];
    const isMessageOwner = message.user.toString() === req.user._id.toString();
    const isGroupCreator = studyGroup.creator.toString() === req.user._id.toString();
    const isModerator = studyGroup.members.some(
      m => m.user.toString() === req.user._id.toString() && m.role === 'moderator'
    );

    if (!isMessageOwner && !isGroupCreator && !isModerator) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own messages'
      });
    }

    studyGroup.discussions.splice(messageIndex, 1);
    await studyGroup.save();

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to delete message',
      error: error.message
    });
  }
});

router.post('/:id/discussions/:messageId/react', protect, async (req, res) => {
  try {
    const { emoji } = req.body;
    const studyGroup = await StudyGroup.findById(req.params.id);

    if (!studyGroup) {
      return res.status(404).json({
        success: false,
        message: 'Study group not found'
      });
    }

    if (!studyGroup.isMember(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'You must be a member to react'
      });
    }

    const discussion = studyGroup.discussions.id(req.params.messageId);
    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    if (!discussion.reactions) {
      discussion.reactions = [];
    }

    const reactionIndex = discussion.reactions.findIndex(
      r => r.user.toString() === req.user._id.toString() && r.emoji === emoji
    );

    if (reactionIndex > -1) {

      discussion.reactions.splice(reactionIndex, 1);
    } else {

      discussion.reactions.push({
        user: req.user._id,
        emoji,
        addedAt: new Date()
      });
    }

    await studyGroup.save();

    res.json({
      success: true,
      data: discussion.reactions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

router.post('/:id/resources', protect, async (req, res) => {
  try {
    const { title, url, type } = req.body;
    const studyGroup = await StudyGroup.findById(req.params.id);

    if (!studyGroup) {
      return res.status(404).json({
        success: false,
        message: 'Study group not found'
      });
    }

    if (!studyGroup.isMember(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'You must be a member to add resources'
      });
    }

    studyGroup.resources.push({
      title,
      url,
      type: type || 'link',
      addedBy: req.user._id,
      addedAt: new Date()
    });

    studyGroup.stats.lastActivity = new Date();
    await studyGroup.save();

    const populatedGroup = await StudyGroup.findById(studyGroup._id)
      .populate('resources.addedBy', 'name avatar');

    res.json({
      success: true,
      data: populatedGroup.resources[populatedGroup.resources.length - 1]
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to add resource',
      error: error.message
    });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const studyGroup = await StudyGroup.findById(req.params.id);

    if (!studyGroup) {
      return res.status(404).json({
        success: false,
        message: 'Study group not found'
      });
    }

    if (studyGroup.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the group creator can delete the group'
      });
    }

    await studyGroup.deleteOne();

    res.json({
      success: true,
      message: 'Study group deleted successfully'
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

