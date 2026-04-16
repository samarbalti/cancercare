const mongoose = require('mongoose');

const ChatHistorySchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  sessionId: {
    type: String,
    default: () => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  },
  messages: [{
    role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    stressAnalysis: {
      detected: Boolean,
      score: Number,
      intensity: String,
      requiresAlert: Boolean
    },
    sources: [{
      documentId: String,
      title: String,
      similarity: Number
    }]
  }],
  metadata: {
    stressPeaks: { type: Number, default: 0 }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ChatHistory', ChatHistorySchema);