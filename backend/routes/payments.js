const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const Course = require('../models/Course');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// @route   POST /api/payments/create-intent
// @desc    Create payment intent for course purchase
// @access  Private
router.post('/create-intent', protect, async (req, res) => {
  try {
    const { courseId, paymentMethod } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if already enrolled
    const user = await User.findById(req.user._id);
    const isEnrolled = user.enrolledCourses.some(
      ec => ec.course.toString() === courseId
    );

    if (isEnrolled) {
      return res.status(400).json({
        success: false,
        message: 'You are already enrolled in this course'
      });
    }

    if (paymentMethod === 'stripe') {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(course.price * 100), // Convert to cents
        currency: course.currency.toLowerCase(),
        metadata: {
          userId: req.user._id.toString(),
          courseId: courseId
        }
      });

      res.json({
        success: true,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      });
    } else {
      // For other payment methods, create pending payment
      const payment = await Payment.create({
        user: req.user._id,
        course: courseId,
        type: 'course',
        amount: course.price,
        currency: course.currency,
        paymentMethod,
        transactionId: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        status: 'pending'
      });

      res.json({
        success: true,
        paymentId: payment._id,
        transactionId: payment.transactionId
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   POST /api/payments/confirm
// @desc    Confirm payment and enroll user
// @access  Private
router.post('/confirm', protect, async (req, res) => {
  try {
    const { paymentId, transactionId } = req.body;

    const payment = await Payment.findOne({
      $or: [
        { _id: paymentId },
        { transactionId }
      ],
      user: req.user._id
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    if (payment.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Payment already confirmed'
      });
    }

    // Update payment status
    payment.status = 'completed';
    payment.paidAt = new Date();
    await payment.save();

    // Enroll user in course
    const user = await User.findById(req.user._id);
    if (payment.course) {
      user.enrolledCourses.push({
        course: payment.course,
        enrolledAt: new Date()
      });
      await user.save();

      // Update course enrollment count
      await Course.findByIdAndUpdate(payment.course, {
        $inc: { studentsEnrolled: 1 }
      });
    }

    res.json({
      success: true,
      message: 'Payment confirmed and enrollment successful',
      payment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/payments/history
// @desc    Get user payment history
// @access  Private
router.get('/history', protect, async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user._id })
      .populate('course', 'title thumbnail')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: payments.length,
      data: payments
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

