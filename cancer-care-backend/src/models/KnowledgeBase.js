const mongoose = require('mongoose');

const KnowledgeBaseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['cancer_info', 'treatment', 'side_effects', 'nutrition', 'mental_health', 'faq', 'general'],
    required: true
  },
  tags: [String],
  source: {
    type: String,
    default: 'internal'
  },
  embedding: {
    type: [Number],
    index: '2dsphere'
  },
  documentId: {
    type: String,
    unique: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  viewCount: {
    type: Number,
    default: 0
  },
  helpfulCount: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('KnowledgeBase', KnowledgeBaseSchema);