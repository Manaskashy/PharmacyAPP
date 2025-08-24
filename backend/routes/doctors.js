const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Doctor = require('../models/Doctor');
const User = require('../models/User');
const { protect, authorize, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/doctors
// @desc    Get all doctors with filtering and pagination
// @access  Public
router.get('/', optionalAuth, [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),
  query('specialization')
    .optional()
    .isIn([
      'cardiology', 'dermatology', 'endocrinology', 'gastroenterology',
      'general_medicine', 'gynecology', 'neurology', 'oncology',
      'ophthalmology', 'orthopedics', 'pediatrics', 'psychiatry',
      'pulmonology', 'urology', 'other'
    ])
    .withMessage('Invalid specialization'),
  query('consultationType')
    .optional()
    .isIn(['video', 'audio', 'chat', 'in_person'])
    .withMessage('Invalid consultation type'),
  query('minExperience')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Min experience must be a non-negative integer'),
  query('maxFee')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Max fee must be a positive number'),
  query('search')
    .optional()
    .isString()
    .withMessage('Search must be a string')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      page = 1,
      limit = 10,
      specialization,
      consultationType,
      minExperience,
      maxFee,
      search,
      sortBy = 'averageRating',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = { isActive: true };

    if (specialization) filter.specialization = specialization;
    if (minExperience) filter.experience = { $gte: parseInt(minExperience) };
    if (maxFee) filter.consultationFee = { $lte: parseFloat(maxFee) };
    if (consultationType) filter.consultationTypes = consultationType;

    // Build search query
    if (search) {
      filter.$or = [
        { 'user.firstName': { $regex: search, $options: 'i' } },
        { 'user.lastName': { $regex: search, $options: 'i' } },
        { specialization: { $regex: search, $options: 'i' } },
        { bio: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const doctors = await Doctor.find(filter)
      .populate('user', 'firstName lastName email phone profilePicture')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v');

    // Get total count for pagination
    const total = await Doctor.countDocuments(filter);

    res.json({
      status: 'success',
      data: {
        doctors,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get doctors error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/doctors/:id
// @desc    Get single doctor by ID
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id)
      .populate('user', 'firstName lastName email phone profilePicture address');

    if (!doctor) {
      return res.status(404).json({
        status: 'error',
        message: 'Doctor not found'
      });
    }

    if (!doctor.isActive) {
      return res.status(404).json({
        status: 'error',
        message: 'Doctor not available'
      });
    }

    res.json({
      status: 'success',
      data: {
        doctor
      }
    });
  } catch (error) {
    console.error('Get doctor error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// @route   POST /api/doctors
// @desc    Create new doctor profile
// @access  Private (Admin only)
router.post('/', protect, authorize('admin'), [
  body('userId')
    .notEmpty()
    .withMessage('User ID is required')
    .isMongoId()
    .withMessage('Invalid user ID'),
  body('specialization')
    .isIn([
      'cardiology', 'dermatology', 'endocrinology', 'gastroenterology',
      'general_medicine', 'gynecology', 'neurology', 'oncology',
      'ophthalmology', 'orthopedics', 'pediatrics', 'psychiatry',
      'pulmonology', 'urology', 'other'
    ])
    .withMessage('Invalid specialization'),
  body('licenseNumber')
    .notEmpty()
    .withMessage('License number is required'),
  body('experience')
    .isInt({ min: 0 })
    .withMessage('Experience must be a non-negative integer'),
  body('consultationFee')
    .isFloat({ min: 0 })
    .withMessage('Consultation fee must be a positive number'),
  body('education')
    .isArray({ min: 1 })
    .withMessage('At least one education record is required'),
  body('education.*.degree')
    .notEmpty()
    .withMessage('Degree is required'),
  body('education.*.institution')
    .notEmpty()
    .withMessage('Institution is required'),
  body('education.*.year')
    .isInt({ min: 1900, max: new Date().getFullYear() })
    .withMessage('Invalid year')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { userId, ...doctorData } = req.body;

    // Check if user exists and is not already a doctor
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    const existingDoctor = await Doctor.findOne({ user: userId });
    if (existingDoctor) {
      return res.status(400).json({
        status: 'error',
        message: 'User is already registered as a doctor'
      });
    }

    // Update user role to doctor
    user.role = 'doctor';
    await user.save();

    // Create doctor profile
    const doctor = new Doctor({
      user: userId,
      ...doctorData
    });

    await doctor.save();

    // Populate user data
    await doctor.populate('user', 'firstName lastName email phone');

    res.status(201).json({
      status: 'success',
      message: 'Doctor profile created successfully',
      data: {
        doctor
      }
    });
  } catch (error) {
    console.error('Create doctor error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// @route   PUT /api/doctors/:id
// @desc    Update doctor profile
// @access  Private (Admin or Doctor themselves)
router.put('/:id', protect, authorize('admin', 'doctor'), [
  body('specialization')
    .optional()
    .isIn([
      'cardiology', 'dermatology', 'endocrinology', 'gastroenterology',
      'general_medicine', 'gynecology', 'neurology', 'oncology',
      'ophthalmology', 'orthopedics', 'pediatrics', 'psychiatry',
      'pulmonology', 'urology', 'other'
    ])
    .withMessage('Invalid specialization'),
  body('consultationFee')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Consultation fee must be a positive number'),
  body('bio')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Bio cannot exceed 1000 characters')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({
        status: 'error',
        message: 'Doctor not found'
      });
    }

    // Check if user is authorized to update this doctor
    if (req.user.role === 'doctor' && doctor.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to update this doctor profile'
      });
    }

    const updatedDoctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('user', 'firstName lastName email phone');

    res.json({
      status: 'success',
      message: 'Doctor profile updated successfully',
      data: {
        doctor: updatedDoctor
      }
    });
  } catch (error) {
    console.error('Update doctor error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/doctors/specializations/list
// @desc    Get list of all specializations
// @access  Public
router.get('/specializations/list', async (req, res) => {
  try {
    const specializations = await Doctor.distinct('specialization');
    
    res.json({
      status: 'success',
      data: {
        specializations
      }
    });
  } catch (error) {
    console.error('Get specializations error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

module.exports = router;

