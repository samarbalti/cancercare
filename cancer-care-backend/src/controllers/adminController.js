const User = require('../models/User');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const MedicalRecord = require('../models/MedicalRecord');

// @desc    Get admin dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private (Admin)
exports.getDashboard = async (req, res, next) => {
  try {
    const stats = {
      users: {
        total: await User.countDocuments(),
        patients: await User.countDocuments({ role: 'patient' }),
        doctors: await User.countDocuments({ role: 'doctor' }),
        admins: await User.countDocuments({ role: 'admin' }),
        newThisMonth: await User.countDocuments({
          createdAt: { $gte: new Date(new Date().setDate(1)) }
        })
      },
      doctors: {
        total: await Doctor.countDocuments(),
        verified: await Doctor.countDocuments({ isVerified: true }),
        pending: await Doctor.countDocuments({ isVerified: false })
      },
      appointments: {
        total: await Appointment.countDocuments(),
        today: await Appointment.countDocuments({
          date: {
            $gte: new Date().setHours(0, 0, 0, 0),
            $lt: new Date().setHours(23, 59, 59, 999)
          }
        }),
        pending: await Appointment.countDocuments({ status: 'pending' })
      },
      medicalRecords: await MedicalRecord.countDocuments()
    };

    // Recent activity
    const recentUsers = await User.find()
      .select('firstName lastName email role createdAt')
      .sort({ createdAt: -1 })
      .limit(10);

    const pendingDoctors = await Doctor.find({ isVerified: false })
      .populate('user', 'firstName lastName email phone createdAt')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        stats,
        recentUsers,
        pendingDoctors
      }
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin)
exports.getUsers = async (req, res, next) => {
  try {
    const { role, status, search, page = 1, limit = 20 } = req.query;
    
    let query = {};
    if (role) query.role = role;
    if (status === 'active') query.isActive = true;
    if (status === 'suspended') query.isActive = false;
    
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      pagination: {
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      },
      data: users
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Get single user
// @route   GET /api/admin/users/:id
// @access  Private (Admin)
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    let profile = null;
    if (user.role === 'patient') {
      profile = await Patient.findOne({ user: user._id })
        .populate('assignedDoctor', 'user specialization');
    } else if (user.role === 'doctor') {
      profile = await Doctor.findOne({ user: user._id });
    }

       res.status(200).json({
      success: true,
      data: {
        user,
        profile
      }
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private (Admin)
exports.updateUser = async (req, res, next) => {
  try {
    const { firstName, lastName, phone, isActive, role } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { firstName, lastName, phone, isActive, role },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Suspend/Activate user account
// @route   PUT /api/admin/users/:id/suspend
// @access  Private (Admin)
exports.suspendUser = async (req, res, next) => {
  try {
    const { reason } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent suspending self
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot suspend your own account'
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    // TODO: Send email notification about suspension

    res.status(200).json({
      success: true,
      message: `User account ${user.isActive ? 'activated' : 'suspended'}`,
      data: user
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent deleting self
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    // Delete associated profile
    if (user.role === 'patient') {
      await Patient.findOneAndDelete({ user: user._id });
      // TODO: Handle cascade delete for appointments, records, etc.
    } else if (user.role === 'doctor') {
      await Doctor.findOneAndDelete({ user: user._id });
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Verify doctor account
// @route   PUT /api/admin/doctors/:id/verify
// @access  Private (Admin)
exports.verifyDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate('user');

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    doctor.isVerified = true;
    doctor.verifiedAt = new Date();
    doctor.verifiedBy = req.user._id;
    await doctor.save();

    // Send approval email
    // TODO: Implement email notification

    res.status(200).json({
      success: true,
      message: 'Doctor verified successfully',
      data: doctor
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Reject doctor verification
// @route   PUT /api/admin/doctors/:id/reject
// @access  Private (Admin)
exports.rejectDoctor = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const doctor = await Doctor.findById(req.params.id).populate('user');

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Send rejection email with reason
    // TODO: Implement email notification

    // Delete doctor profile and user
    await Doctor.findByIdAndDelete(req.params.id);
    await User.findByIdAndDelete(doctor.user._id);

    res.status(200).json({
      success: true,
      message: 'Doctor registration rejected'
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Get system statistics
// @route   GET /api/admin/statistics
// @access  Private (Admin)
exports.getStatistics = async (req, res, next) => {
  try {
    const { period = 'month' } = req.query;
    
    let dateFilter = {};
    const now = new Date();
    
    if (period === 'week') {
      dateFilter = { $gte: new Date(now - 7 * 24 * 60 * 60 * 1000) };
    } else if (period === 'month') {
      dateFilter = { $gte: new Date(now.getFullYear(), now.getMonth(), 1) };
    } else if (period === 'year') {
      dateFilter = { $gte: new Date(now.getFullYear(), 0, 1) };
    }

    const stats = {
      userGrowth: await User.aggregate([
        { $match: { createdAt: dateFilter } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),

      appointmentsByStatus: await Appointment.aggregate([
        { $match: { createdAt: dateFilter } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]),

      appointmentsByDay: await Appointment.aggregate([
        { $match: { date: dateFilter } },
        {
          $group: {
            _id: { $dayOfWeek: '$date' },
            count: { $sum: 1 }
          }
        }
      ]),

      topDoctors: await Appointment.aggregate([
        { $match: { createdAt: dateFilter } },
        {
          $group: {
            _id: '$doctor',
            appointmentCount: { $sum: 1 }
          }
        },
        { $sort: { appointmentCount: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: 'doctors',
            localField: '_id',
            foreignField: '_id',
            as: 'doctor'
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'doctor.user',
            foreignField: '_id',
            as: 'user'
          }
        }
      ]),

    };

    res.status(200).json({
      success: true,
      data: stats
    });

  } catch (error) {
    next(error);
  }
};

exports.getEmergencyLogs = async (req, res, next) => {
  res.status(200).json({ success: true, data: [] });
};

// @desc    Manage educational resources
// @route   GET /api/admin/resources
// @access  Private (Admin)
exports.getResources = async (req, res, next) => {
  try {
    // TODO: Implement Educational Resource model
    res.status(501).json({
      success: false,
      message: 'Educational resources module coming soon'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create educational resource
// @route   POST /api/admin/resources
// @access  Private (Admin)
exports.createResource = async (req, res, next) => {
  try {
    // TODO: Implement
    res.status(501).json({
      success: false,
      message: 'Coming soon'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update educational resource
// @route   PUT /api/admin/resources/:id
// @access  Private (Admin)
exports.updateResource = async (req, res, next) => {
  try {
    // TODO: Implement
    res.status(501).json({
      success: false,
      message: 'Coming soon'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete educational resource
// @route   DELETE /api/admin/resources/:id
// @access  Private (Admin)
exports.deleteResource = async (req, res, next) => {
  try {
    // TODO: Implement
    res.status(501).json({
      success: false,
      message: 'Coming soon'
    });
  } catch (error) {
    next(error);
  }
};