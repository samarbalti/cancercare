const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { restrictTo, isOwnerOrAdmin } = require('../middleware/rbac');
const patientController = require('../controllers/patientController');
const Patient = require('../models/Patient');

// All routes are protected and patient-only
router.use(protect);
router.use(restrictTo('patient'));

// Profile routes
router.get('/profile', patientController.getProfile);
router.put('/profile', patientController.updateProfile);

// Medical records
router.get('/medical-records', patientController.getMedicalRecords);
router.get('/medical-records/:id', patientController.getMedicalRecord);
router.get('/medical-records/:id/download', patientController.downloadMedicalRecord);

// Prescriptions
router.get('/prescriptions', patientController.getPrescriptions);
router.get('/prescriptions/:id', patientController.getPrescription);
router.get('/prescriptions/:id/download', patientController.downloadPrescription);

// Appointments
router.get('/appointments', patientController.getAppointments);
router.post('/appointments', patientController.createAppointment);
router.put('/appointments/:id/cancel', patientController.cancelAppointment);

// Messages
router.get('/messages', patientController.getMessages);
router.post('/messages', patientController.sendMessage);

module.exports = router;