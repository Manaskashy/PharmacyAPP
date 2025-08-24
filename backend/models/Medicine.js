const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Medicine name is required'],
    trim: true,
    maxlength: [100, 'Medicine name cannot exceed 100 characters']
  },
  genericName: {
    type: String,
    required: [true, 'Generic name is required'],
    trim: true
  },
  brandName: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'antibiotics',
      'painkillers',
      'vitamins',
      'supplements',
      'diabetes',
      'hypertension',
      'respiratory',
      'gastrointestinal',
      'dermatological',
      'ophthalmic',
      'dental',
      'other'
    ]
  },
  dosageForm: {
    type: String,
    required: [true, 'Dosage form is required'],
    enum: [
      'tablet',
      'capsule',
      'liquid',
      'injection',
      'cream',
      'ointment',
      'drops',
      'inhaler',
      'suppository',
      'other'
    ]
  },
  strength: {
    type: String,
    required: [true, 'Strength is required'],
    trim: true
  },
  manufacturer: {
    type: String,
    required: [true, 'Manufacturer is required'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  stockQuantity: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    min: [0, 'Stock quantity cannot be negative'],
    default: 0
  },
  prescriptionRequired: {
    type: Boolean,
    default: false
  },
  sideEffects: [{
    type: String,
    trim: true
  }],
  contraindications: [{
    type: String,
    trim: true
  }],
  interactions: [{
    type: String,
    trim: true
  }],
  expiryDate: {
    type: Date,
    required: [true, 'Expiry date is required']
  },
  image: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for search functionality
medicineSchema.index({
  name: 'text',
  genericName: 'text',
  brandName: 'text',
  description: 'text',
  category: 'text'
});

// Virtual for checking if medicine is in stock
medicineSchema.virtual('inStock').get(function() {
  return this.stockQuantity > 0;
});

// Virtual for checking if medicine is expiring soon (within 3 months)
medicineSchema.virtual('expiringSoon').get(function() {
  const threeMonthsFromNow = new Date();
  threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
  return this.expiryDate <= threeMonthsFromNow;
});

// Ensure virtual fields are serialized
medicineSchema.set('toJSON', {
  virtuals: true
});

module.exports = mongoose.model('Medicine', medicineSchema);

