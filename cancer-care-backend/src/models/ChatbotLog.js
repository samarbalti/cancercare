const mongoose = require('mongoose');

const chatbotLogSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  messages: [{
    role: {
      type: String,
      enum: ['user', 'assistant', 'system'],
      required: true
    },
    content: {
      type: String,
      required: true
    },
    intent: {
      type: String,
      enum: [
        'greeting',
        'medical_info',
        'symptom_check',
        'emotional_support',
        'appointment_help',
        'medication_help',
        'emergency',
        'goodbye',
        'other'
      ]
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  context: {
    topic: String,
    lastIntent: String,
    patientMood: {
      type: String,
      enum: ['happy', 'neutral', 'anxious', 'sad', 'distressed', 'urgent']
    },
    discussedTopics: [String]
  },
  emergencyDetected: {
    type: Boolean,
    default: false
  },
  emergencyType: {
    type: String,
    enum: ['physical', 'psychological', 'medication', 'other']
  },
  emergencyDetails: {
    detectedAt: Date,
    keywords: [String],
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical']
    },
    recommendedAction: String
  },
  doctorNotified: {
    type: Boolean,
    default: false
  },
  notificationSentAt: {
    type: Date
  },
  notifiedDoctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor'
  },
  feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    providedAt: Date
  },
  sessionDuration: {
    type: Number // en secondes
  },
  endedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

chatbotLogSchema.index({ patient: 1, createdAt: -1 });
chatbotLogSchema.index({ emergencyDetected: 1, doctorNotified: 1 });

// Méthode pour détecter urgence
chatbotLogSchema.methods.detectEmergency = function() {
  const emergencyKeywords = {
    physical: ['douleur intense', 'saigne', 'saignement', 'perdu connaissance', 'étouffe', 'crise'],
    psychological: ['suicide', 'me tuer', 'mourir', 'désespéré', 'plus envie de vivre'],
    medication: ['overdose', 'trop de médicaments', 'mauvais médicament']
  };
  
  const lastMessage = this.messages[this.messages.length - 1];
  if (!lastMessage || lastMessage.role !== 'user') return false;
  
  const content = lastMessage.content.toLowerCase();
  
  for (const [type, keywords] of Object.entries(emergencyKeywords)) {
    const found = keywords.some(kw => content.includes(kw));
    if (found) {
      this.emergencyDetected = true;
      this.emergencyType = type;
      this.emergencyDetails = {
        detectedAt: new Date(),
        keywords: keywords.filter(kw => content.includes(kw)),
        severity: type === 'psychological' ? 'critical' : 'high',
        recommendedAction: type === 'psychological' 
          ? 'Contact emergency psychological services immediately'
          : 'Contact emergency medical services immediately'
      };
      return true;
    }
  }
  return false;
};

module.exports = mongoose.model('ChatbotLog', chatbotLogSchema);