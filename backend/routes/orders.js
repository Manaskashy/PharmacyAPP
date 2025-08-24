const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Order = require('../models/Order');
const Medicine = require('../models/Medicine');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/orders
// @desc    Get user orders
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    // Build filter
    const filter = { user: req.user._id };
    if (status) filter.orderStatus = status;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const orders = await Order.find(filter)
      .populate('items.medicine', 'name price image')
      .populate('doctor', 'user')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const total = await Order.countDocuments(filter);

    res.json({
      status: 'success',
      data: {
        orders,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/orders/:id
// @desc    Get single order
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.medicine', 'name price image description')
      .populate('doctor', 'user')
      .populate('user', 'firstName lastName email phone');

    if (!order) {
      return res.status(404).json({
        status: 'error',
        message: 'Order not found'
      });
    }

    // Check if user is authorized to view this order
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to view this order'
      });
    }

    res.json({
      status: 'success',
      data: {
        order
      }
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// @route   POST /api/orders
// @desc    Create new order
// @access  Private
router.post('/', protect, [
  body('items')
    .isArray({ min: 1 })
    .withMessage('At least one item is required'),
  body('items.*.medicineId')
    .isMongoId()
    .withMessage('Invalid medicine ID'),
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),
  body('shippingAddress')
    .isObject()
    .withMessage('Shipping address is required'),
  body('shippingAddress.street')
    .notEmpty()
    .withMessage('Street address is required'),
  body('shippingAddress.city')
    .notEmpty()
    .withMessage('City is required'),
  body('shippingAddress.state')
    .notEmpty()
    .withMessage('State is required'),
  body('shippingAddress.zipCode')
    .notEmpty()
    .withMessage('Zip code is required'),
  body('shippingAddress.country')
    .notEmpty()
    .withMessage('Country is required'),
  body('shippingAddress.phone')
    .notEmpty()
    .withMessage('Phone number is required'),
  body('paymentMethod')
    .isIn(['credit_card', 'debit_card', 'paypal', 'cash_on_delivery', 'bank_transfer'])
    .withMessage('Invalid payment method')
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

    const { items, shippingAddress, paymentMethod, notes, doctorId, consultationId } = req.body;

    // Validate medicines and calculate totals
    let totalAmount = 0;
    let prescriptionRequired = false;
    const orderItems = [];

    for (const item of items) {
      const medicine = await Medicine.findById(item.medicineId);
      
      if (!medicine) {
        return res.status(404).json({
          status: 'error',
          message: `Medicine with ID ${item.medicineId} not found`
        });
      }

      if (!medicine.isActive) {
        return res.status(400).json({
          status: 'error',
          message: `Medicine ${medicine.name} is not available`
        });
      }

      if (medicine.stockQuantity < item.quantity) {
        return res.status(400).json({
          status: 'error',
          message: `Insufficient stock for ${medicine.name}. Available: ${medicine.stockQuantity}`
        });
      }

      if (medicine.prescriptionRequired) {
        prescriptionRequired = true;
      }

      const itemTotal = medicine.price * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        medicine: item.medicineId,
        quantity: item.quantity,
        price: medicine.price
      });

      // Update stock
      medicine.stockQuantity -= item.quantity;
      await medicine.save();
    }

    // Calculate final amount (with tax and discount)
    const tax = totalAmount * 0.1; // 10% tax
    const discount = 0; // No discount for now
    const finalAmount = totalAmount + tax - discount;

    // Create order
    const order = new Order({
      user: req.user._id,
      items: orderItems,
      totalAmount,
      shippingAddress,
      paymentMethod,
      prescriptionRequired,
      doctor: doctorId || null,
      consultation: consultationId || null,
      notes,
      tax,
      discount,
      finalAmount
    });

    await order.save();

    // Populate order data
    await order.populate('items.medicine', 'name price image');

    res.status(201).json({
      status: 'success',
      message: 'Order created successfully',
      data: {
        order
      }
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// @route   PUT /api/orders/:id/status
// @desc    Update order status (Admin/Pharmacist only)
// @access  Private
router.put('/:id/status', protect, authorize('admin', 'pharmacist'), [
  body('orderStatus')
    .isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'])
    .withMessage('Invalid order status'),
  body('paymentStatus')
    .optional()
    .isIn(['pending', 'completed', 'failed', 'refunded'])
    .withMessage('Invalid payment status'),
  body('trackingNumber')
    .optional()
    .isString()
    .withMessage('Tracking number must be a string')
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

    const { orderStatus, paymentStatus, trackingNumber, estimatedDelivery } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        status: 'error',
        message: 'Order not found'
      });
    }

    // Update order
    const updateData = { orderStatus };
    if (paymentStatus) updateData.paymentStatus = paymentStatus;
    if (trackingNumber) updateData.trackingNumber = trackingNumber;
    if (estimatedDelivery) updateData.estimatedDelivery = new Date(estimatedDelivery);

    // Set actual delivery date if status is delivered
    if (orderStatus === 'delivered') {
      updateData.actualDelivery = new Date();
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('items.medicine', 'name price image');

    res.json({
      status: 'success',
      message: 'Order status updated successfully',
      data: {
        order: updatedOrder
      }
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

module.exports = router;

