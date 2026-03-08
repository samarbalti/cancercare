const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { restrictTo } = require('../middleware/rbac');

// Import du contrôleur - vérifie ce chemin
const chatbotController = require('../controllers/chatbotController');

// Debug - décommente pour voir ce qui est importé
// console.log('Chatbot Controller:', chatbotController);
// console.log('sendMessage:', chatbotController.sendMessage);

// Protected routes for patients
router.use(protect);

router.post('/message', restrictTo('patient'), chatbotController.sendMessage);
router.get('/history', restrictTo('patient'), chatbotController.getHistory);
router.get('/history/:sessionId', restrictTo('patient'), chatbotController.getConversation);
router.post('/end-session', restrictTo('patient'), chatbotController.endSession);
router.post('/feedback', restrictTo('patient'), chatbotController.submitFeedback);

// Admin stats
router.get('/stats', restrictTo('admin'), chatbotController.getStats);

module.exports = router;