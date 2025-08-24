const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  specialization: {
    type: String,
    required: [true, 'Specialization is required'],
    enum: [
      'cardiology',
      'dermatology',
      'endocrinology',
      'gastroenterology',
      'general_medicine',
      'gynecology',
      'neurology',
      'oncology',
      'ophthalmology',
      'orthopedics',
      'pediatrics',
      'psychiatry',
      'pulmonology',
      'urology',
      'other'
    ]
  },
  licenseNumber: {
    type: String,
    required: [true, 'License number is required'],
    unique: true,
    trim: true
  },
  experience: {
    type: Number,
    required: [true, 'Years of experience is required'],
    min: [0, 'Experience cannot be negative']
  },
  education: [{
    degree: {
      type: String,
      required: true
    },
    institution: {
      type: String,
      required: true
    },
    year: {
      type: Number,
      required: true
    }
  }],
  certifications: [{
    name: String,
    issuingAuthority: String,
    year: Number,
    expiryDate: Date
  }],
  consultationFee: {
    type: Number,
    required: [true, 'Consultation fee is required'],
    min: [0, 'Consultation fee cannot be negative']
  },
  availability: [{
    day: {
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    },
    startTime: {
      type: String,
      required: true
    },
    endTime: {
      type: String,
      required: true
    },
    isAvailable: {
      type: Boolean,
      default: true
    }
  }],
  languages: [{
    type: String,
    trim: true
  }],
  bio: {
    type: String,
    maxlength: [1000, 'Bio cannot exceed 1000 characters']
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  totalConsultations: {
    type: Number,
    default: 0
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  consultationTypes: [{
    type: String,
    enum: ['video', 'audio', 'chat', 'in_person'],
    default: ['video', 'chat']
  }],
  specialties: [{
    type: String,
    trim: true
  }],
  hospitalAffiliations: [{
    name: String,
    position: String,
    startDate: Date,
    endDate: Date
  }]
}, {
  timestamps: true
});

// Virtual for full name
doctorSchema.virtual('fullName').get(function() {
  return this.user ? `${this.user.firstName} ${this.user.lastName}` : '';
});

// Virtual for checking if doctor is available today
doctorSchema.virtual('isAvailableToday').get(function() {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'lowercase' });
  const todaySchedule = this.availability.find(schedule => schedule.day === today);
  return todaySchedule && todaySchedule.isAvailable;
});

// Ensure virtual fields are serialized
doctorSchema.set('toJSON', {
  virtuals: true
});

module.exports = mongoose.model('Doctor', doctorSchema);

