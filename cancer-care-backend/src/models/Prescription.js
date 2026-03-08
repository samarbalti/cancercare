const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
  prescriptionNumber: {
    type: String,
    unique: true,
    index: true
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  medicalRecord: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MedicalRecord'
  },
  diagnosis: {
    type: String,
    required: true
  },
  medications: [{
    name: {
      type: String,
      required: true
    },
    genericName: String,
    dosage: {
      type: String,
      required: true
    },
    form: {
      type: String,
      enum: ['tablet', 'capsule', 'syrup', 'injection', 'cream', 'drops', 'inhaler', 'other']
    },
    frequency: {
      type: String,
      required: true
    },
    duration: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: false,
      default: 1
    },
    instructions: {
      type: String,
      trim: true
    },
    takeWithFood: {
      type: Boolean,
      default: false
    },
    takeBeforeBed: {
      type: Boolean,
      default: false
    },
    warnings: [String],
    sideEffects: [String]
  }],
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  refills: {
    allowed: {
      type: Number,
      default: 0
    },
    remaining: {
      type: Number,
      default: 0
    }
  },
  pharmacy: {
    name: String,
    phone: String,
    address: String
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled', 'on-hold'],
    default: 'active'
  },
  reminders: {
    enabled: {
      type: Boolean,
      default: true
    },
    times: [{
      type: String // "08:00", "14:00", etc.
    }]
  },
  notes: {
    type: String,
    trim: true
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

prescriptionSchema.index({ patient: 1, status: 1 });

// Générer numéro de prescription avant sauvegarde
prescriptionSchema.pre('save', async function(next) {
  if (!this.isNew) {
    this.updatedAt = Date.now();
    return next();
  }
  
  if (!this.prescriptionNumber) {
    const date = new Date();
    const prefix = 'RX';
    const timestamp = date.getTime().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    this.prescriptionNumber = `${prefix}-${timestamp}-${random}`;
  }
  
  // Calculer date de fin basée sur la durée la plus longue
  if (this.medications && this.medications.length > 0) {
    const durations = this.medications.map(med => {
      const match = med.duration.match(/(\d+)/);
      return match ? parseInt(match[1]) : 7;
    });
    const maxDays = Math.max(...durations);
    this.endDate = new Date(Date.now() + maxDays * 24 * 60 * 60 * 1000);
  }
  
  next();
});

module.exports = mongoose.model('Prescription', prescriptionSchema);