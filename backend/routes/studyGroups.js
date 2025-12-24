const express = require('express');
const router = express.Router();
const StudyGroup = require('../models/StudyGroup');
const { protect } = require('../middleware/auth');

// @route   GET /api/study-groups
// @desc    Get all study groups with filters
// @access  Public (for public groups) / Protected (for private groups)
router.get('/', async (req, res) => {
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

    // Build query
    const query = { status };

    // If user is authenticated and wants their groups
    if (myGroups === 'true' && req.user) {
      query.$or = [
        { creator: req.user._id },
        { 'members.user': req.user._id }
      ];
    } else if (!req.user) {
      // Non-authenticated users can only see public groups
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

    // Pagination
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

// @route   GET /api/study-groups/:id
// @desc    Get single study group
// @access  Public (for public groups) / Protected (for private groups)
router.get('/:id', async (req, res) => {
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

    // Check if user can access private group
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

// @route   POST /api/study-groups
// @desc    Create a new study group
// @access  Protected
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

    // Create study group
    const studyGroup = new StudyGroup({
      name,
      description,
      creator: req.user._id,
      level: level || 'all',
      focus: focus || 'general',
      maxMembers: maxMembers || 20,
      isPrivate: isPrivate || false,
      meetingSchedule: meetingSchedule || {},
      studyGoals: studyGoals || [],
      tags: tags || []
    });

    // Add creator as first member
    studyGroup.addMember(req.user._id, 'member');

    // Generate invite code if private
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

// @route   PUT /api/study-groups/:id
// @desc    Update study group
// @access  Protected (creator or moderator only)
router.put('/:id', protect, async (req, res) => {
  try {
    const studyGroup = await StudyGroup.findById(req.params.id);

    if (!studyGroup) {
      return res.status(404).json({
        success: false,
        message: 'Study group not found'
      });
    }

    // Check if user is creator or moderator
    if (!studyGroup.isModerator(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Only group creator or moderators can update the group'
      });
    }

    // Update allowed fields
    const allowedUpdates = [
      'name', 'description', 'level', 'focus', 'maxMembers',
      'isPrivate', 'meetingSchedule', 'studyGoals', 'tags', 'image', 'status'
    ];
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        studyGroup[field] = req.body[field];
      }
    });

    // Regenerate invite code if privacy changed to private
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

// @route   POST /api/study-groups/:id/join
// @desc    Join a study group
// @access  Protected
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

    // Check if already a member
    if (studyGroup.isMember(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: 'You are already a member of this group'
      });
    }

    // Check if private group requires invite code
    if (studyGroup.isPrivate) {
      if (!inviteCode || inviteCode !== studyGroup.inviteCode) {
        return res.status(403).json({
          success: false,
          message: 'Invalid invite code for private group'
        });
      }
    }

    // Add member
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

// @route   POST /api/study-groups/:id/leave
// @desc    Leave a study group
// @access  Protected
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

    // Remove member
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

// @route   POST /api/study-groups/:id/members/:userId/remove
// @desc    Remove a member from study group
// @access  Protected (creator or moderator only)
router.post('/:id/members/:userId/remove', protect, async (req, res) => {
  try {
    const studyGroup = await StudyGroup.findById(req.params.id);

    if (!studyGroup) {
      return res.status(404).json({
        success: false,
        message: 'Study group not found'
      });
    }

    // Check if user is creator or moderator
    if (!studyGroup.isModerator(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Only group creator or moderators can remove members'
      });
    }

    // Remove member
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

// @route   POST /api/study-groups/:id/discussions
// @desc    Add a discussion message to study group
// @access  Protected (members only)
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

    res.json({
      success: true,
      data: populatedGroup.discussions[populatedGroup.discussions.length - 1]
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to add discussion',
      error: error.message
    });
  }
});

// @route   POST /api/study-groups/:id/resources
// @desc    Add a resource to study group
// @access  Protected (members only)
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

// @route   DELETE /api/study-groups/:id
// @desc    Delete study group
// @access  Protected (creator only)
router.delete('/:id', protect, async (req, res) => {
  try {
    const studyGroup = await StudyGroup.findById(req.params.id);

    if (!studyGroup) {
      return res.status(404).json({
        success: false,
        message: 'Study group not found'
      });
    }

    // Only creator can delete
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

