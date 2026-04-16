const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const emailService = require('../services/emailService');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);
  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      phone: user.phone,
      avatar: user.avatar
    }
  });
};

exports.registerPatient = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const { email, password, firstName, lastName, phone, dateOfBirth, gender, bloodType, emergencyContact } = req.body;

    if (await User.findOne({ email })) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    const user = await User.create({ email, password, firstName, lastName, phone, role: 'patient' });
    await Patient.create({ user: user._id, dateOfBirth, gender, bloodType, emergencyContact });
    emailService.sendWelcomeEmail(user.email, user.firstName).catch(console.error);
    sendTokenResponse(user, 201, res);
  } catch (error) { next(error); }
};

exports.registerDoctor = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const { email, password, firstName, lastName, phone, specialization, licenseNumber, hospital, department, bio, experience } = req.body;

    if (await User.findOne({ email })) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    const user = await User.create({ email, password, firstName, lastName, phone, role: 'doctor' });
    await Doctor.create({ user: user._id, specialization, licenseNumber, hospital, department, bio, experience, isVerified: false });

    emailService.notifyNewDoctorRegistration({ firstName, lastName, email, specialization }).catch(() => {});

    res.status(201).json({
      success: true,
      message: 'Registration successful. Your account is pending admin approval.',
      data: { id: user._id, email: user.email, status: 'pending_verification' }
    });
  } catch (error) { next(error); }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Please provide email and password' });

    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    if (!await user.comparePassword(password)) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    if (!user.isActive) return res.status(401).json({ success: false, message: 'Your account has been suspended.' });

    if (user.role === 'doctor') {
      const doctor = await Doctor.findOne({ user: user._id });
      if (!doctor || !doctor.isVerified) {
        return res.status(401).json({ success: false, message: 'Your account is pending admin approval.' });
      }
    }

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });
    sendTokenResponse(user, 200, res);
  } catch (error) { next(error); }
};

exports.logout = async (req, res, next) => {
  try {
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) { next(error); }
};

exports.getMe = async (req, res, next) => {
  try {
    let userData = {
      id: req.user._id, email: req.user.email,
      firstName: req.user.firstName, lastName: req.user.lastName,
      role: req.user.role, phone: req.user.phone,
      avatar: req.user.avatar, createdAt: req.user.createdAt
    };

    if (req.user.role === 'patient') {
      userData.profile = await Patient.findOne({ user: req.user._id }).populate('assignedDoctor', 'user specialization').lean() || null;
    } else if (req.user.role === 'doctor') {
      userData.profile = await Doctor.findOne({ user: req.user._id }).lean() || null;
    }

    res.status(200).json({ success: true, data: userData });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error loading profile information' });
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).json({ success: false, message: 'User not found with this email' });

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    try {
      await emailService.sendPasswordResetEmail(user.email, resetUrl);
      res.status(200).json({ success: true, message: 'Password reset email sent' });
    } catch {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
      res.status(500).json({ success: false, message: 'Email could not be sent' });
    }
  } catch (error) { next(error); }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.resettoken).digest('hex');
    const user = await User.findOne({ resetPasswordToken, resetPasswordExpire: { $gt: Date.now() } });
    if (!user) return res.status(400).json({ success: false, message: 'Invalid or expired token' });

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    sendTokenResponse(user, 200, res);
  } catch (error) { next(error); }
};

exports.updatePassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('+password');
    if (!await user.comparePassword(req.body.currentPassword)) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }
    user.password = req.body.newPassword;
    await user.save();
    sendTokenResponse(user, 200, res);
  } catch (error) { next(error); }
};

exports.updateDetails = async (req, res, next) => {
  try {
    const fields = {};
    if (req.body.firstName) fields.firstName = req.body.firstName;
    if (req.body.lastName) fields.lastName = req.body.lastName;
    if (req.body.phone) fields.phone = req.body.phone;

    const user = await User.findByIdAndUpdate(req.user.id, fields, { new: true, runValidators: true });
    res.status(200).json({ success: true, data: user });
  } catch (error) { next(error); }
};
