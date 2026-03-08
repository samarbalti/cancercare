const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const appointmentController = require('../controllers/appointmentController');

router.use(protect);

// Create and get my appointments
router.post('/', appointmentController.createAppointment);
router.get('/', appointmentController.getMyAppointments);

// Get available slots
router.get('/slots', appointmentController.getAvailableSlots);

// Get single appointment
router.get('/:id', appointmentController.getAppointment);

// Confirm appointment (doctor only)
router.put('/:id/confirm', appointmentController.confirmAppointment);

// Cancel appointment
router.delete('/:id', appointmentController.cancelAppointment);

// Reschedule appointment
router.put('/:id/reschedule', appointmentController.rescheduleAppointment);

module.exports = router;