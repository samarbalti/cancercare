const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { restrictTo } = require('../middleware/rbac');
const notificationController = require('../controllers/notificationController');

router.use(protect);

// User notifications
router.get('/', notificationController.getNotifications);
router.get('/unread-count', notificationController.getUnreadCount);
router.put('/:id/read', notificationController.markAsRead);
router.put('/read-all', notificationController.markAllAsRead);
router.delete('/:id', notificationController.deleteNotification);
router.put('/preferences', notificationController.updatePreferences);

// Admin only
router.post('/', restrictTo('admin'), notificationController.createNotification);

module.exports = router;