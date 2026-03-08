const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  specialization: {
    type: String,
    required: [true, 'Specialization is required'],
    trim: true
  },
  subSpecializations: [{
    type: String,
    trim: true
  }],
  licenseNumber: {
    type: String,
    required: [true, 'License number is required'],
    unique: true,
    trim: true
  },
  hospital: {
    type: String,
    trim: true
  },
  department: {
    type: String,
    trim: true
  },
  bio: {
    type: String,
    maxlength: 1000
  },
  education: [{
    degree: String,
    institution: String,
    year: Number
  }],
  experience: {
    type: Number, // années d'expérience
    default: 0
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verifiedAt: {
    type: Date
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  availability: [{
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      required: true
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
  appointmentDuration: {
    type: Number,
    default: 30 // minutes
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  patients: [{
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient'
    },
    assignedAt: {
      type: Date,
      default: Date.now
    }
  }],
  maxPatientsPerDay: {
    type: Number,
    default: 20
  },
  languages: [{
    type: String,
    trim: true
  }],
  consultationFee: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

doctorSchema.pre('save', function(next) {
  if (!this.isNew) {
    this.updatedAt = Date.now();
  }
  next();
});

// Vérifier disponibilité
doctorSchema.methods.isAvailableOn = function(day, time) {
  const slot = this.availability.find(a => a.day === day && a.isAvailable);
  if (!slot) return false;
  
  const [slotHour, slotMin] = slot.startTime.split(':').map(Number);
  const [slotEndHour, slotEndMin] = slot.endTime.split(':').map(Number);
  const [checkHour, checkMin] = time.split(':').map(Number);
  
  const slotStart = slotHour * 60 + slotMin;
  const slotEnd = slotEndHour * 60 + slotEndMin;
  const check = checkHour * 60 + checkMin;
  
  return check >= slotStart && check < slotEnd;
};

module.exports = mongoose.model('Doctor', doctorSchema);