const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Medicine = require('../models/Medicine');
const { protect, authorize, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/medicines
// @desc    Get all medicines with filtering and pagination
// @access  Public
router.get('/', optionalAuth, [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('category')
    .optional()
    .isIn([
      'antibiotics', 'painkillers', 'vitamins', 'supplements',
      'diabetes', 'hypertension', 'respiratory', 'gastrointestinal',
      'dermatological', 'ophthalmic', 'dental', 'other'
    ])
    .withMessage('Invalid category'),
  query('dosageForm')
    .optional()
    .isIn([
      'tablet', 'capsule', 'liquid', 'injection', 'cream',
      'ointment', 'drops', 'inhaler', 'suppository', 'other'
    ])
    .withMessage('Invalid dosage form'),
  query('minPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Min price must be a positive number'),
  query('maxPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Max price must be a positive number'),
  query('inStock')
    .optional()
    .isBoolean()
    .withMessage('In stock must be a boolean'),
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
      category,
      dosageForm,
      minPrice,
      maxPrice,
      inStock,
      search,
      sortBy = 'name',
      sortOrder = 'asc'
    } = req.query;

    // Build filter object
    const filter = { isActive: true };

    if (category) filter.category = category;
    if (dosageForm) filter.dosageForm = dosageForm;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }
    if (inStock === 'true') filter.stockQuantity = { $gt: 0 };

    // Build search query
    if (search) {
      filter.$text = { $search: search };
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const medicines = await Medicine.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v');

    // Get total count for pagination
    const total = await Medicine.countDocuments(filter);

    res.json({
      status: 'success',
      data: {
        medicines,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get medicines error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/medicines/:id
// @desc    Get single medicine by ID
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id);

    if (!medicine) {
      return res.status(404).json({
        status: 'error',
        message: 'Medicine not found'
      });
    }

    if (!medicine.isActive) {
      return res.status(404).json({
        status: 'error',
        message: 'Medicine not available'
      });
    }

    res.json({
      status: 'success',
      data: {
        medicine
      }
    });
  } catch (error) {
    console.error('Get medicine error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// @route   POST /api/medicines
// @desc    Create new medicine
// @access  Private (Admin/Pharmacist only)
router.post('/', protect, authorize('admin', 'pharmacist'), [
  body('name')
    .notEmpty()
    .withMessage('Medicine name is required')
    .isLength({ max: 100 })
    .withMessage('Medicine name cannot exceed 100 characters'),
  body('genericName')
    .notEmpty()
    .withMessage('Generic name is required'),
  body('description')
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('category')
    .isIn([
      'antibiotics', 'painkillers', 'vitamins', 'supplements',
      'diabetes', 'hypertension', 'respiratory', 'gastrointestinal',
      'dermatological', 'ophthalmic', 'dental', 'other'
    ])
    .withMessage('Invalid category'),
  body('dosageForm')
    .isIn([
      'tablet', 'capsule', 'liquid', 'injection', 'cream',
      'ointment', 'drops', 'inhaler', 'suppository', 'other'
    ])
    .withMessage('Invalid dosage form'),
  body('strength')
    .notEmpty()
    .withMessage('Strength is required'),
  body('manufacturer')
    .notEmpty()
    .withMessage('Manufacturer is required'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('stockQuantity')
    .isInt({ min: 0 })
    .withMessage('Stock quantity must be a non-negative integer'),
  body('expiryDate')
    .isISO8601()
    .withMessage('Please enter a valid expiry date')
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

    const medicine = new Medicine(req.body);
    await medicine.save();

    res.status(201).json({
      status: 'success',
      message: 'Medicine created successfully',
      data: {
        medicine
      }
    });
  } catch (error) {
    console.error('Create medicine error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// @route   PUT /api/medicines/:id
// @desc    Update medicine
// @access  Private (Admin/Pharmacist only)
router.put('/:id', protect, authorize('admin', 'pharmacist'), [
  body('name')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Medicine name cannot exceed 100 characters'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('category')
    .optional()
    .isIn([
      'antibiotics', 'painkillers', 'vitamins', 'supplements',
      'diabetes', 'hypertension', 'respiratory', 'gastrointestinal',
      'dermatological', 'ophthalmic', 'dental', 'other'
    ])
    .withMessage('Invalid category'),
  body('dosageForm')
    .optional()
    .isIn([
      'tablet', 'capsule', 'liquid', 'injection', 'cream',
      'ointment', 'drops', 'inhaler', 'suppository', 'other'
    ])
    .withMessage('Invalid dosage form'),
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('stockQuantity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stock quantity must be a non-negative integer'),
  body('expiryDate')
    .optional()
    .isISO8601()
    .withMessage('Please enter a valid expiry date')
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

    const medicine = await Medicine.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!medicine) {
      return res.status(404).json({
        status: 'error',
        message: 'Medicine not found'
      });
    }

    res.json({
      status: 'success',
      message: 'Medicine updated successfully',
      data: {
        medicine
      }
    });
  } catch (error) {
    console.error('Update medicine error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// @route   DELETE /api/medicines/:id
// @desc    Delete medicine (soft delete)
// @access  Private (Admin/Pharmacist only)
router.delete('/:id', protect, authorize('admin', 'pharmacist'), async (req, res) => {
  try {
    const medicine = await Medicine.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!medicine) {
      return res.status(404).json({
        status: 'error',
        message: 'Medicine not found'
      });
    }

    res.json({
      status: 'success',
      message: 'Medicine deleted successfully'
    });
  } catch (error) {
    console.error('Delete medicine error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/medicines/categories/list
// @desc    Get list of all medicine categories
// @access  Public
router.get('/categories/list', async (req, res) => {
  try {
    const categories = await Medicine.distinct('category');
    
    res.json({
      status: 'success',
      data: {
        categories
      }
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/medicines/dosage-forms/list
// @desc    Get list of all dosage forms
// @access  Public
router.get('/dosage-forms/list', async (req, res) => {
  try {
    const dosageForms = await Medicine.distinct('dosageForm');
    
    res.json({
      status: 'success',
      data: {
        dosageForms
      }
    });
  } catch (error) {
    console.error('Get dosage forms error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

module.exports = router;

