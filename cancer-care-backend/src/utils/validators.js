const { body, validationResult } = require('express-validator');

// Custom validators
exports.isValidDate = (value) => {
  if (!value) return true;
  const date = new Date(value);
  return date instanceof Date && !isNaN(date);
};

exports.isFutureDate = (value) => {
  const date = new Date(value);
  const now = new Date();
  return date > now;
};

exports.isValidTime = (value) => {
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(value);
};

// Validation result handler
exports.handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg
      }))
    });
  }
  next();
};

// Common validation chains
exports.emailValidation = body('email')
  .isEmail()
  .normalizeEmail()
  .withMessage('Valid email is required');

exports.passwordValidation = body('password')
  .isLength({ min: 6 })
  .withMessage('Password must be at least 6 characters')
  .matches(/\d/)
  .withMessage('Password must contain a number');

exports.phoneValidation = body('phone')
  .optional()
  .trim()
  .matches(/^[\d\s\-\+\(\)]+$/)
  .withMessage('Invalid phone number format');