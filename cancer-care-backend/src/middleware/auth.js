const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ==============================
// Protect middleware
// ==============================
exports.protect = async (req, res, next) => {
  try {
    let token;

    console.log('🔐 Auth headers:', req.headers.authorization);

    // Bearer token
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Cookie token (optional)
    else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, no token'
      });
    }

    // verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account suspended'
      });
    }

    req.user = user;
    next();

  } catch (error) {
    console.error('❌ Auth error:', error.message);

    return res.status(401).json({
      success: false,
      message: 'Not authorized'
    });
  }
};


// ==============================
// Cookie auth (optional)
// ==============================
exports.protectCookie = async (req, res, next) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);

    next();

  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized'
    });
  }
};