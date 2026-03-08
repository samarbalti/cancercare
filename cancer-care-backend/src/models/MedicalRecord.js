const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema({
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
  recordType: {
    type: String,
    enum: ['consultation', 'test', 'surgery', 'hospitalization', 'follow-up'],
    default: 'consultation'
  },
  diagnosis: {
    primary: {
      type: String,
      required: true
    },
    secondary: [String],
    icd10Code: String // Code médical international
  },
  symptoms: [{
    name: String,
    severity: {
      type: String,
      enum: ['mild', 'moderate', 'severe']
    },
    duration: String,
    notes: String
  }],
  vitalSigns: {
    bloodPressure: {
      systolic: Number,
      diastolic: Number
    },
    heartRate: Number,
    temperature: Number,
    respiratoryRate: Number,
    oxygenSaturation: Number,
    weight: Number,
    height: Number,
    bmi: Number
  },
  tests: [{
    name: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['blood', 'imaging', 'biopsy', 'genetic', 'other']
    },
    result: String,
    value: String,
    normalRange: String,
    isAbnormal: Boolean,
    date: Date,
    lab: String,
    fileUrl: String,
    notes: String
  }],
  cancerSpecific: {
    cancerType: String,
    stage: String,
    grade: String,
    tumorSize: String,
    lymphNodes: String,
    metastasis: String,
    biomarkers: [{
      name: String,
      value: String,
      status: String
    }]
  },
  treatments: [{
    type: {
      type: String,
      enum: ['surgery', 'chemotherapy', 'radiation', 'immunotherapy', 'targeted', 'hormonal', 'other']
    },
    name: String,
    protocol: String,
    startDate: Date,
    endDate: Date,
    cycles: Number,
    completedCycles: Number,
    response: {
      type: String,
      enum: ['complete', 'partial', 'stable', 'progression', 'not-evaluated']
    },
    sideEffects: [String],
    notes: String
  }],
  medications: [{
    name: String,
    dosage: String,
    frequency: String,
    route: String,
    startDate: Date,
    endDate: Date,
    prescribedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor'
    }
  }],
  notes: {
    type: String,
    trim: true
  },
  attachments: [{
    filename: String,
    originalName: String,
    mimeType: String,
    size: Number,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isConfidential: {
    type: Boolean,
    default: false
  },
  accessLog: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    action: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

medicalRecordSchema.index({ patient: 1, createdAt: -1 });
medicalRecordSchema.index({ doctor: 1 });

medicalRecordSchema.pre('save', function(next) {
  if (!this.isNew) {
    this.updatedAt = Date.now();
  }
  
  // Calculer BMI si poids et taille disponibles
  if (this.vitalSigns.weight && this.vitalSigns.height) {
    const heightInM = this.vitalSigns.height / 100;
    this.vitalSigns.bmi = parseFloat(
      (this.vitalSigns.weight / (heightInM * heightInM)).toFixed(2)
    );
  }
  
  next();
});

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);