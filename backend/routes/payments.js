const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const Course = require('../models/Course');
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const { protect } = require('../middleware/auth');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

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
        amount: Math.round(course.price * 100),
        currency: course.currency.toLowerCase(),
        metadata: {
          userId: req.user._id.toString(),
          courseId: courseId.toString(),
          type: 'course'
        }
      });

      res.json({
        success: true,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: course.price,
        currency: course.currency,
        course: {
          id: course._id,
          title: course.title,
          thumbnail: course.thumbnail
        }
      });
    } else {

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
        transactionId: payment.transactionId,
        amount: course.price,
        currency: course.currency,
        course: {
          id: course._id,
          title: course.title,
          thumbnail: course.thumbnail
        }
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

router.post('/enroll-free', protect, async (req, res) => {
  try {
    const { courseId } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

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

    // Create a completed payment record for tracking
    const payment = await Payment.create({
      user: req.user._id,
      course: courseId,
      type: 'course',
      amount: 0,
      currency: 'GHS',
      paymentMethod: 'free',
      transactionId: `FREE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      status: 'completed',
      paidAt: new Date()
    });

    // Enroll user
    user.enrolledCourses.push({
      course: courseId,
      enrolledAt: new Date()
    });
    await user.save();

    await Course.findByIdAndUpdate(courseId, {
      $inc: { studentsEnrolled: 1 }
    });

    res.json({
      success: true,
      message: 'Enrollment successful',
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

    payment.status = 'completed';
    payment.paidAt = new Date();
    await payment.save();

    const user = await User.findById(req.user._id);
    if (payment.course) {
      user.enrolledCourses.push({
        course: payment.course,
        enrolledAt: new Date()
      });
      await user.save();

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

router.post('/create-subscription-intent', protect, async (req, res) => {
  try {
    const { planId, planName, price, period, paymentMethod } = req.body;

    if (!planId || !price || !period) {
      return res.status(400).json({
        success: false,
        message: 'Plan details are required'
      });
    }

    const durationDays = period === 'month' ? 30 : 365;

    if (paymentMethod === 'stripe') {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(price * 100),
        currency: 'ghs',
        metadata: {
          userId: req.user._id.toString(),
          planId: planId,
          planName: planName,
          period: period,
          type: 'teacher-subscription'
        }
      });

      res.json({
        success: true,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: price,
        currency: 'GHS',
        planId,
        planName,
        period,
        durationDays
      });
    } else {

      const payment = await Payment.create({
        user: req.user._id,
        type: 'subscription',
        amount: price,
        currency: 'GHS',
        paymentMethod,
        transactionId: `SUBSCRIPTION-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        status: 'pending',
        metadata: new Map([
          ['planId', planId],
          ['planName', planName],
          ['period', period],
          ['durationDays', durationDays.toString()]
        ])
      });

      res.json({
        success: true,
        paymentId: payment._id,
        transactionId: payment.transactionId,
        amount: price,
        currency: 'GHS',
        planId,
        planName,
        period,
        durationDays
      });
    }
  } catch (error) {
    console.error('Subscription payment intent error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

router.post('/confirm-subscription', protect, async (req, res) => {
  try {
    const { paymentId, transactionId, paymentIntentId } = req.body;

    let payment;
    if (paymentIntentId) {

      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      if (paymentIntent.status !== 'succeeded') {
        return res.status(400).json({
          success: false,
          message: 'Payment not completed'
        });
      }

      payment = await Payment.findOne({
        paymentIntentId,
        user: req.user._id
      });

      if (!payment) {

        const metadata = paymentIntent.metadata;
        const durationDays = metadata.period === 'month' ? 30 : 365;
        payment = await Payment.create({
          user: req.user._id,
          type: 'subscription',
          amount: paymentIntent.amount / 100,
          currency: paymentIntent.currency.toUpperCase(),
          paymentMethod: 'stripe',
          transactionId: `STRIPE-${paymentIntent.id}`,
          paymentIntentId: paymentIntent.id,
          status: 'completed',
          paidAt: new Date(),
          metadata: {
            planId: metadata.planId,
            planName: metadata.planName,
            period: metadata.period,
            durationDays: durationDays.toString()
          }
        });
      } else {
        payment.status = 'completed';
        payment.paidAt = new Date();
        await payment.save();
      }
    } else {
      payment = await Payment.findOne({
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

      payment.status = 'completed';
      payment.paidAt = new Date();
      await payment.save();
    }

    try {
      const planId = payment.metadata?.get('planId') || payment.metadata?.planId || 'basic';
      const planName = payment.metadata?.get('planName') || payment.metadata?.planName || 'Basic Teacher';
      const durationDays = parseInt(payment.metadata?.get('durationDays') || payment.metadata?.durationDays || '30');
      const planType = planId === 'basic' ? 'monthly' : planId === 'professional' ? 'monthly' : planId === 'enterprise' ? 'yearly' : 'monthly';

      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + durationDays);

      const subscription = await Subscription.create({
        user: req.user._id,
        plan: {
          type: planType,
          name: planName,
          price: payment.amount,
          currency: payment.currency || 'GHS',
          duration: durationDays,
          features: []
        },
        status: 'active',
        startDate,
        endDate,
        payment: {
          paymentId: payment._id.toString(),
          paymentMethod: payment.paymentMethod,
          transactionId: payment.transactionId,
          amount: payment.amount,
          currency: payment.currency || 'GHS',
          paidAt: payment.paidAt || new Date()
        },
        autoRenew: false
      });

      await User.findByIdAndUpdate(req.user._id, {
        'subscription.type': planType,
        'subscription.startDate': startDate,
        'subscription.endDate': endDate,
        'subscription.isActive': true
      });

      payment.subscriptionId = subscription._id.toString();
      await payment.save();
    } catch (subError) {
      console.error('Failed to create subscription:', subError);

    }

    res.json({
      success: true,
      message: 'Subscription payment confirmed and activated',
      payment
    });
  } catch (error) {
    console.error('Subscription confirmation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

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


router.post('/unenroll', protect, async (req, res) => {
  try {
    const { courseId } = req.body;

    const user = await User.findById(req.user._id);
    const initialLength = user.enrolledCourses.length;

    user.enrolledCourses = user.enrolledCourses.filter(
      ec => ec.course.toString() !== courseId
    );

    if (user.enrolledCourses.length < initialLength) {
      await user.save();

      // Decrement student count, ensuring it doesn't go below 0
      await Course.findOneAndUpdate(
        { _id: courseId, studentsEnrolled: { $gt: 0 } },
        { $inc: { studentsEnrolled: -1 } }
      );
    }

    res.json({
      success: true,
      message: 'Successfully unenrolled'
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

