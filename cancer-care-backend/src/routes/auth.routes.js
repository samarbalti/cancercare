const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Validation middleware
const registerPatientValidation = [
  body('email').isEmail().toLowerCase().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('phone').optional().trim(),
  body('dateOfBirth').optional().isISO8601().toDate(),
  body('gender').optional().isIn(['male', 'female', 'other']),
  body('emergencyContact').optional().isObject()
];

const registerDoctorValidation = [
  body('email').isEmail().toLowerCase().withMessage('Email valide requis'),
  body('password').isLength({ min: 6 }).withMessage('Mot de passe minimum 6 caractères'),
  body('firstName').trim().notEmpty().withMessage('Prénom requis'),
  body('lastName').trim().notEmpty().withMessage('Nom requis'),
  body('specialization').trim().notEmpty().withMessage('Spécialisation requise'),
  body('licenseNumber').trim().notEmpty().withMessage('Numéro de licence requis'),
  body('phone').optional().trim(),
  body('hospital').optional().trim(),
  body('department').optional().trim(),
  body('bio').optional().trim(),
  body('experience').optional().isInt({ min: 0 })
];

const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').exists()
];

// Public routes
router.post('/register-patient', registerPatientValidation, authController.registerPatient);
router.post('/register-doctor', registerDoctorValidation, authController.registerDoctor);
router.post('/login', loginValidation, authController.login);
router.post('/forgot-password', body('email').isEmail(), authController.forgotPassword);
router.put('/reset-password/:resettoken', authController.resetPassword);

// Protected routes
router.use(protect);
router.get('/logout', authController.logout);
router.get('/me', authController.getMe);
router.put('/update-details', authController.updateDetails);
router.put('/update-password', 
  body('currentPassword').exists(),
  body('newPassword').isLength({ min: 6 }),
  authController.updatePassword
);

module.exports = router;