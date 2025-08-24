const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { protect, authorize, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/lab-tests
// @desc    Get all lab tests
// @access  Public
router.get('/', optionalAuth, async (req, res) => {
  try {
    // Mock data for lab tests
    const labTests = [
      {
        id: '1',
        name: 'Complete Blood Count (CBC)',
        description: 'Measures red blood cells, white blood cells, and platelets',
        price: 25.00,
        category: 'blood',
        preparation: 'Fasting required for 8-12 hours',
        duration: '15-20 minutes',
        resultsTime: '24-48 hours'
      },
      {
        id: '2',
        name: 'Lipid Profile',
        description: 'Measures cholesterol and triglyceride levels',
        price: 35.00,
        category: 'blood',
        preparation: 'Fasting required for 12-14 hours',
        duration: '15-20 minutes',
        resultsTime: '24-48 hours'
      },
      {
        id: '3',
        name: 'Diabetes Screening',
        description: 'Blood glucose and HbA1c testing',
        price: 30.00,
        category: 'blood',
        preparation: 'Fasting required for 8-12 hours',
        duration: '15-20 minutes',
        resultsTime: '24-48 hours'
      }
    ];

    res.json({
      status: 'success',
      data: {
        labTests
      }
    });
  } catch (error) {
    console.error('Get lab tests error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

module.exports = router;

