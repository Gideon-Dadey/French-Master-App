const express = require('express');
const router = express.Router();
const Subscription = require('../models/Subscription');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  try {
    const subscriptions = await Subscription.find({ user: req.user.id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: subscriptions.length,
      data: subscriptions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

router.get('/active', protect, async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      user: req.user.id,
      status: 'active'
    }).sort({ endDate: -1 });

    if (!subscription || !subscription.isActive()) {
      return res.json({
        success: true,
        data: null,
        message: 'No active subscription'
      });
    }

    res.json({
      success: true,
      data: subscription
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
    const { plan, payment } = req.body;

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + plan.duration);

    const subscription = await Subscription.create({
      user: req.user.id,
      plan,
      status: 'active',
      startDate,
      endDate,
      payment,
      autoRenew: req.body.autoRenew || false
    });

    await User.findByIdAndUpdate(req.user.id, {
      'subscription.type': plan.type,
      'subscription.startDate': startDate,
      'subscription.endDate': endDate,
      'subscription.isActive': true
    });

    res.status(201).json({
      success: true,
      data: subscription
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to create subscription',
      error: error.message
    });
  }
});

router.put('/:id/cancel', protect, async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    subscription.status = 'cancelled';
    subscription.cancelledAt = new Date();
    subscription.cancellationReason = req.body.reason;
    subscription.autoRenew = false;
    await subscription.save();

    res.json({
      success: true,
      data: subscription,
      message: 'Subscription cancelled successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to cancel subscription',
      error: error.message
    });
  }
});

router.get('/plans', async (req, res) => {
  try {
    const plans = [
      {
        type: 'free',
        name: 'Free Plan',
        price: 0,
        currency: 'GHS',
        duration: 0,
        features: [
          'Access to free courses',
          'Basic progress tracking',
          'Community access'
        ]
      },
      {
        type: 'monthly',
        name: 'Monthly Premium',
        price: 49.99,
        currency: 'GHS',
        duration: 30,
        features: [
          'Access to all courses',
          'Premium content',
          'Certificates',
          'Priority support',
          'Offline downloads'
        ]
      },
      {
        type: 'yearly',
        name: 'Yearly Premium',
        price: 499.99,
        currency: 'GHS',
        duration: 365,
        features: [
          'Access to all courses',
          'Premium content',
          'Certificates',
          'Priority support',
          'Offline downloads',
          'AI-powered learning',
          '1-on-1 tutoring sessions'
        ]
      }
    ];

    res.json({
      success: true,
      data: plans
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

