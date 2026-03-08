const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { restrictTo } = require('../middleware/rbac');
const adminController = require('../controllers/adminController');

// All routes are protected and admin-only
router.use(protect);
router.use(restrictTo('admin'));

// Dashboard
router.get('/dashboard', adminController.getDashboard);
router.get('/statistics', adminController.getStatistics);

// User management
router.get('/users', adminController.getUsers);
router.get('/users/:id', adminController.getUser);
router.put('/users/:id', adminController.updateUser);
router.put('/users/:id/suspend', adminController.suspendUser);
router.delete('/users/:id', adminController.deleteUser);

// Doctor verification
router.put('/doctors/:id/verify', adminController.verifyDoctor);
router.put('/doctors/:id/reject', adminController.rejectDoctor);

// Emergency logs
router.get('/emergencies', adminController.getEmergencyLogs);

// Educational resources
router.get('/resources', adminController.getResources);
router.post('/resources', adminController.createResource);
router.put('/resources/:id', adminController.updateResource);
router.delete('/resources/:id', adminController.deleteResource);

module.exports = router;