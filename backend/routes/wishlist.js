const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Wishlist = require('../models/Wishlist');

router.get('/', protect, async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user.id })
      .populate('courses', 'title thumbnail price isFree rating studentsEnrolled');

    if (!wishlist) {
      return res.status(200).json({
        success: true,
        data: { courses: [] }
      });
    }

    res.status(200).json({
      success: true,
      data: wishlist
    });
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch wishlist'
    });
  }
});

router.post('/:courseId', protect, async (req, res) => {
  try {
    const { courseId } = req.params;

    let wishlist = await Wishlist.findOne({ user: req.user.id });

    if (!wishlist) {
      wishlist = new Wishlist({
        user: req.user.id,
        courses: [courseId]
      });
    } else {
      if (wishlist.courses.includes(courseId)) {
        return res.status(400).json({
          success: false,
          message: 'Course already in wishlist'
        });
      }
      wishlist.courses.push(courseId);
    }

    await wishlist.save();

    res.status(200).json({
      success: true,
      data: wishlist
    });
  } catch (error) {
    console.error('Add to wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add to wishlist'
    });
  }
});

router.delete('/:courseId', protect, async (req, res) => {
  try {
    const { courseId } = req.params;

    const wishlist = await Wishlist.findOne({ user: req.user.id });

    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: 'Wishlist not found'
      });
    }

    wishlist.courses = wishlist.courses.filter(
      id => id.toString() !== courseId
    );

    await wishlist.save();

    res.status(200).json({
      success: true,
      data: wishlist
    });
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove from wishlist'
    });
  }
});

module.exports = router;

