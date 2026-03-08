// Restreindre l'accès selon les rôles
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to perform this action'
      });
    }
    next();
  };
};

// Vérifier si c'est le propriétaire ou admin
exports.isOwnerOrAdmin = (model, paramName = 'id') => {
  return async (req, res, next) => {
    try {
      // Admin peut tout faire
      if (req.user.role === 'admin') {
        return next();
      }

      const resourceId = req.params[paramName];
      const resource = await model.findById(resourceId);

      if (!resource) {
        return res.status(404).json({
          success: false,
          message: 'Resource not found'
        });
      }

      // Vérifier propriété selon le modèle
      let isOwner = false;
      
      if (model.modelName === 'Patient') {
        isOwner = resource.user.toString() === req.user._id.toString();
      } else if (model.modelName === 'Doctor') {
        isOwner = resource.user.toString() === req.user._id.toString();
      } else if (['Appointment', 'MedicalRecord', 'Prescription', 'Message'].includes(model.modelName)) {
        isOwner = resource.patient?.toString() === req.user._id.toString() || 
                  resource.doctor?.toString() === req.user._id.toString();
      }

      if (!isOwner) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to access this resource'
        });
      }

      req.resource = resource;
      next();

    } catch (error) {
      next(error);
    }
  };
};

// Middleware spécifique pour médecin
exports.isDoctor = (req, res, next) => {
  if (req.user.role !== 'doctor') {
    return res.status(403).json({
      success: false,
      message: 'This action requires doctor privileges'
    });
  }
  next();
};

// Middleware spécifique pour patient
exports.isPatient = (req, res, next) => {
  if (req.user.role !== 'patient') {
    return res.status(403).json({
      success: false,
      message: 'This action requires patient privileges'
    });
  }
  next();
};