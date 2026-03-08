const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const User = require('../models/User');
const emailService = require('../services/emailService');

// @desc    Create a new appointment
// @route   POST /api/appointments
// @access  Private/Patient
exports.createAppointment = async (req, res, next) => {
  try {
    const { doctorId, date, startTime, reason, symptoms, type, isVirtual } = req.body;

    if (!doctorId || !date || !startTime || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: doctorId, date, startTime, reason'
      });
    }

    // Get patient record
    const patient = await Patient.findOne({ user: req.user._id });
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient record not found'
      });
    }

    // Get doctor
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Check for conflicts
    const endTime = calculateEndTime(startTime, doctor.appointmentDuration);
    const conflict = await Appointment.findOne({
      doctor: doctorId,
      date: {
        $gte: new Date(date).setHours(0, 0, 0, 0),
        $lt: new Date(date).setHours(23, 59, 59, 999)
      },
      startTime: startTime,
      status: { $nin: ['cancelled'] }
    });

    if (conflict) {
      return res.status(400).json({
        success: false,
        message: 'This time slot is already booked'
      });
    }

    // Create appointment
    const appointment = await Appointment.create({
      patient: patient._id,
      doctor: doctorId,
      date: new Date(date),
      startTime: startTime,
      endTime: endTime,
      reason: reason,
      symptoms: symptoms || [],
      type: type || 'consultation',
      isVirtual: isVirtual || false,
      status: 'pending'
    });

    // Populate references
    const populatedAppointment = await appointment.populate([
      { path: 'patient', select: 'user dateOfBirth' },
      { path: 'doctor', select: 'user specialization hospital' }
    ]);

    // Send email notification to doctor
    try {
      const doctorUser = await User.findById(doctor.user);
      const patientUser = await User.findById(patient.user);
      
      if (doctorUser && patientUser) {
        await emailService.sendNewAppointmentNotification(
          doctorUser.email,
          doctorUser.name,
          {
            firstName: patientUser.firstName,
            lastName: patientUser.lastName,
            email: patientUser.email,
            phone: patient.phone || ''
          },
          appointment
        );
      }
    } catch (emailError) {
      console.error('❌ Error sending email to doctor:', emailError);
      // Don't fail the request if email fails
    }

    res.status(201).json({
      success: true,
      data: populatedAppointment
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Get my appointments (for patient)
// @route   GET /api/appointments
// @access  Private/Patient
exports.getMyAppointments = async (req, res, next) => {
  try {
    const { status } = req.query;
    let query = {};

    // Get patient record
    const patient = await Patient.findOne({ user: req.user._id });
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient record not found'
      });
    }

    query.patient = patient._id;

    if (status) {
      query.status = status;
    }

    const appointments = await Appointment.find(query)
      .populate('doctor', 'user specialization hospital')
      .populate('patient', 'user dateOfBirth')
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      data: appointments
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Cancel appointment
// @route   DELETE /api/appointments/:id
// @access  Private
exports.cancelAppointment = async (req, res, next) => {
  try {
    const { cancellationReason } = req.body;

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check permissions
    const patient = await Patient.findById(appointment.patient);
    const canCancel = 
      req.user.role === 'admin' ||
      (req.user.role === 'patient' && patient.user.toString() === req.user._id.toString()) ||
      (req.user.role === 'doctor' && appointment.doctor.toString() === req.user._id.toString());

    if (!canCancel) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this appointment'
      });
    }

    // Check if appointment can be cancelled
    if (['completed', 'cancelled'].includes(appointment.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel a ${appointment.status} appointment`
      });
    }

    // Update appointment
    appointment.status = 'cancelled';
    appointment.cancelledBy = req.user._id;
    appointment.cancellationReason = cancellationReason || '';

    await appointment.save();

    const populatedAppointment = await appointment.populate([
      { path: 'patient', select: 'user dateOfBirth' },
      { path: 'doctor', select: 'user specialization hospital' }
    ]);

    res.status(200).json({
      success: true,
      data: populatedAppointment
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Confirm appointment (Doctor only)
// @route   PUT /api/appointments/:id/confirm
// @access  Private/Doctor
exports.confirmAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check if user is the doctor assigned to this appointment
    const doctor = await Doctor.findById(appointment.doctor);
    if (!doctor || doctor.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the assigned doctor can confirm this appointment'
      });
    }

    // Check if appointment is pending
    if (appointment.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot confirm a ${appointment.status} appointment`
      });
    }

    // Update appointment status to confirmed
    appointment.status = 'confirmed';
    await appointment.save();

    const populatedAppointment = await appointment.populate([
      { path: 'patient', select: 'user dateOfBirth' },
      { path: 'doctor', select: 'user specialization hospital' }
    ]);

    // Send confirmation email to patient
    try {
      const patient = await Patient.findById(appointment.patient).populate('user');
      const doctorUser = await User.findById(doctor.user);
      
      if (patient && patient.user && doctorUser) {
        await emailService.sendAppointmentConfirmedNotification(
          patient.user.email,
          patient.user.firstName,
          doctorUser.name,
          appointment
        );
      }
    } catch (emailError) {
      console.error('❌ Error sending confirmation email to patient:', emailError);
      // Don't fail the request if email fails
    }

    res.status(200).json({
      success: true,
      message: 'Appointment confirmed successfully',
      data: populatedAppointment
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Get available time slots for a doctor
// @route   GET /api/appointments/slots
// @access  Private
exports.getAvailableSlots = async (req, res, next) => {
  try {
    const { doctorId, date } = req.query;

    if (!doctorId || !date) {
      return res.status(400).json({
        success: false,
        message: 'Doctor ID and date are required'
      });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    const requestedDate = new Date(date);
    const dayOfWeek = requestedDate.toLocaleDateString('en-US', { weekday: 'long' });

    // Get doctor's availability for that day
    const dayAvailability = doctor.availability.find(
      a => a.day === dayOfWeek && a.isAvailable
    );

    if (!dayAvailability) {
      return res.status(200).json({
        success: true,
        data: []
      });
    }

    // Generate all possible slots
    const slots = [];
    const [startHour, startMin] = dayAvailability.startTime.split(':').map(Number);
    const [endHour, endMin] = dayAvailability.endTime.split(':').map(Number);
    const duration = doctor.appointmentDuration;

    let currentTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;

    // Get existing appointments for that date
    const existingAppointments = await Appointment.find({
      doctor: doctorId,
      date: {
        $gte: new Date(date).setHours(0, 0, 0, 0),
        $lt: new Date(date).setHours(23, 59, 59, 999)
      },
      status: { $nin: ['cancelled'] }
    });

    const bookedSlots = existingAppointments.map(apt => apt.startTime);

    while (currentTime + duration <= endTime) {
      const hours = Math.floor(currentTime / 60);
      const mins = currentTime % 60;
      const timeString = `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;

      if (!bookedSlots.includes(timeString)) {
        slots.push({
          time: timeString,
          available: true
        });
      }

      currentTime += duration;
    }

    res.status(200).json({
      success: true,
      data: slots
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Get appointment by ID
// @route   GET /api/appointments/:id
// @access  Private
exports.getAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patient', 'user dateOfBirth')
      .populate('doctor', 'user specialization hospital');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check if user has access to this appointment
    const hasAccess = 
      req.user.role === 'admin' ||
      (req.user.role === 'patient' && appointment.patient.user.toString() === req.user._id.toString()) ||
      (req.user.role === 'doctor' && appointment.doctor.user.toString() === req.user._id.toString());

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this appointment'
      });
    }

    res.status(200).json({
      success: true,
      data: appointment
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Reschedule appointment
// @route   PUT /api/appointments/:id/reschedule
// @access  Private
exports.rescheduleAppointment = async (req, res, next) => {
  try {
    const { newDate, newStartTime, reason } = req.body;

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check permissions
    const canReschedule = 
      req.user.role === 'admin' ||
      (req.user.role === 'patient' && appointment.patient.toString() === req.user._id.toString()) ||
      (req.user.role === 'doctor' && appointment.doctor.toString() === req.user._id.toString());

    if (!canReschedule) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to reschedule this appointment'
      });
    }

    // Check if appointment can be rescheduled
    if (['completed', 'cancelled'].includes(appointment.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot reschedule a ${appointment.status} appointment`
      });
    }

    // Get doctor for duration
    const doctor = await Doctor.findById(appointment.doctor);

    // Check for conflicts
    const conflict = await Appointment.checkConflict(
      appointment.doctor,
      newDate,
      newStartTime,
      calculateEndTime(newStartTime, doctor.appointmentDuration),
      appointment._id
    );

    if (conflict) {
      return res.status(400).json({
        success: false,
        message: 'New time slot is not available'
      });
    }

    // Update appointment
    appointment.date = newDate;
    appointment.startTime = newStartTime;
    appointment.endTime = calculateEndTime(newStartTime, doctor.appointmentDuration);
    appointment.status = 'pending'; // Reset to pending for doctor confirmation
    appointment.notes = `${appointment.notes || ''}\n[Rescheduled]: ${reason}`;

    await appointment.save();

    // TODO: Send notifications to both parties

    res.status(200).json({
      success: true,
      data: appointment
    });

  } catch (error) {
    next(error);
  }
};

// Helper function to calculate end time
function calculateEndTime(startTime, durationMinutes) {
  const [hours, minutes] = startTime.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes + durationMinutes;
  const endHours = Math.floor(totalMinutes / 60);
  const endMinutes = totalMinutes % 60;
  return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
}

module.exports.calculateEndTime = calculateEndTime;