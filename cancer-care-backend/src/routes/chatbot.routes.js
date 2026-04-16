const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbotController.js');

// Chat
router.post('/message', chatbotController.chat);
router.post('/chat/stream', chatbotController.streamChat);

// Scan prescription
router.post('/scan-prescription', chatbotController.scanPrescription);

// History
router.get('/history/:patientId', chatbotController.getHistory);
router.get('/session/:sessionId', chatbotController.getSessionDetails);
router.get('/stats/:patientId', chatbotController.getStats);

// Alerts (doctor dashboard)
router.get('/alerts', chatbotController.getAlerts);
router.post('/alerts/:alertId/viewed', chatbotController.markAlertAsViewed);
router.post('/alerts/:alertId/handle', chatbotController.handleAlert);
router.post('/alerts/:alertId/resolve', chatbotController.resolveAlert);
router.get('/patients/:patientId/report', chatbotController.getPatientReport);

// Upload knowledge
router.post('/upload-knowledge', chatbotController.uploadKnowledge);

// Health
router.get('/health', (req, res) => {
  res.json({ status: 'OK', services: ['groq', 'rag', 'ocr', 'stress-detection'] });
});

module.exports = router;