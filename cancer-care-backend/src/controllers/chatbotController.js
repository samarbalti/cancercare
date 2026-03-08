const chatbotService = require('../services/chatbotAI');
const ChatbotLog = require('../models/ChatbotLog');
const Patient = require('../models/Patient');

// @desc    Send message to chatbot
// @route   POST /api/chatbot/message
// @access  Private (Patient)
exports.sendMessage = async (req, res, next) => {
  try {
    const { message, sessionId } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    // Get patient ID
    const patient = await Patient.findOne({ user: req.user._id });
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient profile not found'
      });
    }

    // Process message with AI
    const result = await chatbotService.processMessage(patient._id, message);

    res.status(200).json(result);

  } catch (error) {
    next(error);
  }
};

// @desc    Get chat history
// @route   GET /api/chatbot/history
// @access  Private (Patient)
exports.getHistory = async (req, res, next) => {
  try {
    const patient = await Patient.findOne({ user: req.user._id });
    
    const history = await chatbotService.getConversationHistory(patient._id);

    res.status(200).json({
      success: true,
      data: history
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Get specific conversation
// @route   GET /api/chatbot/history/:sessionId
// @access  Private (Patient)
exports.getConversation = async (req, res, next) => {
  try {
    const patient = await Patient.findOne({ user: req.user._id });

    const conversation = await ChatbotLog.findOne({
      sessionId: req.params.sessionId,
      patient: patient._id
    }).select('messages context emergencyDetected emergencyType createdAt endedAt');

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    res.status(200).json({
      success: true,
      data: conversation
    });

  } catch (error) {
    next(error);
  }
};

// @desc    End chat session
// @route   POST /api/chatbot/end-session
// @access  Private (Patient)
exports.endSession = async (req, res, next) => {
  try {
    const { sessionId, feedback } = req.body;

    const session = await chatbotService.endSession(sessionId);

    if (feedback) {
      await chatbotService.addFeedback(sessionId, feedback.rating, feedback.comment);
    }

    res.status(200).json({
      success: true,
      message: 'Session ended',
      data: session
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Submit feedback for chatbot
// @route   POST /api/chatbot/feedback
// @access  Private (Patient)
exports.submitFeedback = async (req, res, next) => {
  try {
    const { sessionId, rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    const session = await chatbotService.addFeedback(sessionId, rating, comment);

    res.status(200).json({
      success: true,
      message: 'Feedback submitted',
      data: session
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Get chatbot stats (admin)
// @route   GET /api/chatbot/stats
// @access  Private (Admin)
exports.getStats = async (req, res, next) => {
  try {
    const stats = await ChatbotLog.aggregate([
      {
        $group: {
          _id: null,
          totalConversations: { $sum: 1 },
          totalMessages: { $sum: { $size: '$messages' } },
          emergenciesDetected: {
            $sum: { $cond: ['$emergencyDetected', 1, 0] }
          },
          avgSessionDuration: { $avg: '$sessionDuration' },
          avgFeedbackRating: { $avg: '$feedback.rating' }
        }
      }
    ]);

    const dailyStats = await ChatbotLog.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          conversations: { $sum: 1 },
          emergencies: { $sum: { $cond: ['$emergencyDetected', 1, 0] } }
        }
      },
      { $sort: { _id: -1 } },
      { $limit: 30 }
    ]);

    const intentStats = await ChatbotLog.aggregate([
      { $unwind: '$messages' },
      { $match: { 'messages.intent': { $exists: true } } },
      {
        $group: {
          _id: '$messages.intent',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        overall: stats[0] || {},
        daily: dailyStats,
        intents: intentStats
      }
    });

  } catch (error) {
    next(error);
  }
};