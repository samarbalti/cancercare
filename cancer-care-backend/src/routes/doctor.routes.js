const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

// Toutes les routes nécessitent authentification + rôle doctor
router.use(protect);
router.use(authorize('doctor'));

router.get('/dashboard', doctorController.getDashboard);
router.get('/patients', doctorController.getPatients);
router.post('/patients', doctorController.addPatient);
router.put('/patients/:id/medical-record', doctorController.updateMedicalRecord);
router.delete('/patients/:id', doctorController.deletePatient);
router.post('/prescriptions', doctorController.createPrescription);
router.get('/appointments', doctorController.getAppointments);
router.get('/messages', doctorController.getMessages);
router.get('/alerts', doctorController.getAlerts);
router.put('/alerts/:id/resolve', doctorController.resolveAlert);
router.post('/test-alert', doctorController.createTestAlert);
router.get('/patients/export', doctorController.exportPatients);
router.post('/messages', doctorController.sendMessage);

module.exports = router;
