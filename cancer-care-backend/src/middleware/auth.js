const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Vérifier si l'utilisateur est connecté
exports.protect = async (req, res, next) => {
  try {
    let token;

    console.log('🔐 Auth middleware - Headers:', req.headers.authorization);
    
    // Vérifier header Authorization
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    // Vérifier cookie (optionnel)
    else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    console.log('🔐 Token found:', token ? 'YES' : 'NO');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    try {
      // Vérifier token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('🔐 Token decoded, user ID:', decoded.id);

      // Vérifier si l'utilisateur existe toujours
      const user = await User.findById(decoded.id);

      if (!user) {
        console.log('❌ User not found');
        return res.status(401).json({
          success: false,
          message: 'User no longer exists'
        });
      }

      console.log('✅ User found:', user.email, 'Role:', user.role);

      // Vérifier si le compte est actif
      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Your account has been suspended. Please contact support.'
        });
      }

      // Ajouter l'utilisateur à la requête
      req.user = user;
      next();

    } catch (error) {
      console.log('❌ Token verification failed:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

  } catch (error) {
    next(error);
  }
};

// Optionnel: Authentification par cookie
exports.protectCookie = async (req, res, next) => {
  try {
    const token = req.cookies.token;

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
    res.status(401).json({
      success: false,
      message: 'Not authorized'
    });
  }
};