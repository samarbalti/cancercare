const Patient = require('../models/Patient');
const User = require('../models/User');
const MedicalRecord = require('../models/MedicalRecord');
const Prescription = require('../models/Prescription');
const Appointment = require('../models/Appointment');
const Message = require('../models/Message');
const pdfService = require('../services/pdfService');
const path = require('path');
const fs = require('fs');

// @desc    Get patient profile
// @route   GET /api/patient/profile
// @access  Private (Patient)
exports.getProfile = async (req, res, next) => {
  try {
    console.log('=== GET PROFILE DEBUG ===');
    console.log('User ID:', req.user?._id);
    console.log('User Role:', req.user?.role);
    
    const patient = await Patient.findOne({ user: req.user._id })
      .populate('user', '-password')
      .populate({ path: 'assignedDoctor', select: 'user specialization hospital', strictPopulate: false })
      .lean();

    console.log('Patient found:', patient ? 'YES' : 'NO');
    
    if (!patient) {
      console.log('Patient profile not found for user:', req.user._id);
      return res.status(404).json({
        success: false,
        message: 'Patient profile not found'
      });
    }

    console.log('Returning patient profile');
    res.status(200).json({
      success: true,
      data: patient
    });

  } catch (error) {
    console.error('Error in getProfile:', error);
    return res.status(500).json({
      success: false,
      message: 'Error loading profile',
      error: error.message
    });
  }
};

// @desc    Update patient profile
// @route   PUT /api/patient/profile
// @access  Private (Patient)
exports.updateProfile = async (req, res, next) => {
  try {
    const {
      dateOfBirth,
      gender,
      bloodType,
      height,
      weight,
      allergies,
      emergencyContact,
      address,
      insurance
    } = req.body;

    const patient = await Patient.findOneAndUpdate(
      { user: req.user._id },
      {
        dateOfBirth,
        gender,
        bloodType,
        height,
        weight,
        allergies,
        emergencyContact,
        address,
        insurance
      },
      { new: true, runValidators: true }
    ).populate('user', '-password');

    res.status(200).json({
      success: true,
      data: patient
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Get medical records
// @route   GET /api/patient/medical-records
// @access  Private (Patient)
exports.getMedicalRecords = async (req, res, next) => {
  try {
    const patient = await Patient.findOne({ user: req.user._id });
    
    const records = await MedicalRecord.find({ patient: patient._id })
      .populate('doctor', 'user specialization')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: records.length,
      data: records
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Get single medical record
// @route   GET /api/patient/medical-records/:id
// @access  Private (Patient)
exports.getMedicalRecord = async (req, res, next) => {
  try {
    const patient = await Patient.findOne({ user: req.user._id });
    
    const record = await MedicalRecord.findOne({
      _id: req.params.id,
      patient: patient._id
    }).populate('doctor', 'user specialization');

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Medical record not found'
      });
    }

    // Log access
    record.accessLog.push({
      user: req.user._id,
      action: 'viewed',
      timestamp: new Date()
    });
    await record.save();

    res.status(200).json({
      success: true,
      data: record
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Download medical record as PDF
// @route   GET /api/patient/medical-records/:id/download
// @access  Private (Patient)
exports.downloadMedicalRecord = async (req, res, next) => {
  try {
    const patient = await Patient.findOne({ user: req.user._id })
      .populate('user', '-password');
    
    const record = await MedicalRecord.findOne({
      _id: req.params.id,
      patient: patient._id
    }).populate('doctor', 'user specialization licenseNumber hospital');

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Medical record not found'
      });
    }

    // Generate PDF
    const pdfResult = await pdfService.generateMedicalRecordPDF(
      record,
      patient,
      record.doctor
    );

    console.log('📄 PDF generated:', pdfResult.filename, 'Size:', require('fs').statSync(pdfResult.filepath).size, 'bytes');

    // Set proper headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${pdfResult.filename}"`);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    // Send file using download method
    res.download(pdfResult.filepath, pdfResult.filename, (err) => {
      if (err) {
        console.error('❌ Download error:', err);
        // Clean up file if error
        require('fs').unlink(pdfResult.filepath, (unlinkErr) => {
          if (unlinkErr) console.error('File cleanup error:', unlinkErr);
        });
        next(err);
      } else {
        console.log('✅ Download successful');
        // Clean up file after successful download
        setTimeout(() => {
          require('fs').unlink(pdfResult.filepath, (unlinkErr) => {
            if (unlinkErr) console.error('File cleanup error:', unlinkErr);
            else console.log('♻️ Downloaded file cleaned up');
          });
        }, 1000);
      }
    });

  } catch (error) {
    console.error('❌ Error in downloadMedicalRecord:', error);
    next(error);
  }
};

// @desc    Get prescriptions
// @route   GET /api/patient/prescriptions
// @access  Private (Patient)
exports.getPrescriptions = async (req, res, next) => {
  try {
    const patient = await Patient.findOne({ user: req.user._id });
    
    const prescriptions = await Prescription.find({ patient: patient._id })
      .populate('doctor', 'user specialization')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: prescriptions.length,
      data: prescriptions
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Get single prescription
// @route   GET /api/patient/prescriptions/:id
// @access  Private (Patient)
exports.getPrescription = async (req, res, next) => {
  try {
    const patient = await Patient.findOne({ user: req.user._id });
    
    const prescription = await Prescription.findOne({
      _id: req.params.id,
      patient: patient._id
    }).populate('doctor', 'user specialization licenseNumber');

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      });
    }

    res.status(200).json({
      success: true,
      data: prescription
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Download prescription as PDF
// @route   GET /api/patient/prescriptions/:id/download
// @access  Private (Patient)
exports.downloadPrescription = async (req, res, next) => {
  try {
    const patient = await Patient.findOne({ user: req.user._id })
      .populate('user', '-password');
    
    const prescription = await Prescription.findOne({
      _id: req.params.id,
      patient: patient._id
    }).populate('doctor', 'user specialization licenseNumber hospital');

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      });
    }

    // Generate PDF
    const pdfResult = await pdfService.generatePrescriptionPDF(
      prescription,
      patient,
      prescription.doctor
    );

    console.log('📄 PDF generated:', pdfResult.filename, 'Size:', require('fs').statSync(pdfResult.filepath).size, 'bytes');

    // Set proper headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${pdfResult.filename}"`);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    // Send file using download method
    res.download(pdfResult.filepath, pdfResult.filename, (err) => {
      if (err) {
        console.error('❌ Download error:', err);
        // Clean up file if error
        require('fs').unlink(pdfResult.filepath, (unlinkErr) => {
          if (unlinkErr) console.error('File cleanup error:', unlinkErr);
        });
        next(err);
      } else {
        console.log('✅ Download successful');
        // Clean up file after successful download
        setTimeout(() => {
          require('fs').unlink(pdfResult.filepath, (unlinkErr) => {
            if (unlinkErr) console.error('File cleanup error:', unlinkErr);
            else console.log('♻️ Downloaded file cleaned up');
          });
        }, 1000);
      }
    });

  } catch (error) {
    console.error('❌ Error in downloadPrescription:', error);
    next(error);
  }
};

// @desc    Get appointments
// @route   GET /api/patient/appointments
// @access  Private (Patient)
exports.getAppointments = async (req, res, next) => {
  try {
    const patient = await Patient.findOne({ user: req.user._id });
    
    const { status, upcoming, past } = req.query;
    let query = { patient: patient._id };

    if (status) query.status = status;
    
    if (upcoming === 'true') {
      query.date = { $gte: new Date() };
      query.status = { $nin: ['cancelled'] };
    }
    
    if (past === 'true') {
      query.date = { $lt: new Date() };
    }

    const appointments = await Appointment.find(query)
      .populate('doctor', 'user specialization hospital')
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Create appointment request
// @route   POST /api/patient/appointments
// @access  Private (Patient)
exports.createAppointment = async (req, res, next) => {
  try {
    const { doctorId, date, startTime, reason, type, symptoms } = req.body;

    const patient = await Patient.findOne({ user: req.user._id });

    // Check if doctor exists and is verified
    const Doctor = require('../models/Doctor');
    const doctor = await Doctor.findById(doctorId);
    if (!doctor || !doctor.isVerified) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found or not verified'
      });
    }

    // Check doctor availability
    const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
    const isAvailable = doctor.isAvailableOn(dayOfWeek, startTime);
    
    if (!isAvailable) {
      return res.status(400).json({
        success: false,
        message: 'Doctor is not available at this time'
      });
    }

    // Check for conflicts
    const conflict = await Appointment.checkConflict(
      doctorId,
      date,
      startTime,
      calculateEndTime(startTime, doctor.appointmentDuration)
    );

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
      date,
      startTime,
      endTime: calculateEndTime(startTime, doctor.appointmentDuration),
      reason,
      type: type || 'consultation',
      symptoms,
      status: 'pending'
    });

    // Populate for response
    await appointment.populate('doctor', 'user specialization');

    res.status(201).json({
      success: true,
      data: appointment
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Cancel appointment
// @route   PUT /api/patient/appointments/:id/cancel
// @access  Private (Patient)
exports.cancelAppointment = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const patient = await Patient.findOne({ user: req.user._id });

    const appointment = await Appointment.findOne({
      _id: req.params.id,
      patient: patient._id
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    if (appointment.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Appointment is already cancelled'
      });
    }

    if (appointment.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel a completed appointment'
      });
    }

    appointment.status = 'cancelled';
    appointment.cancelledBy = req.user._id;
    appointment.cancellationReason = reason;
    await appointment.save();

    res.status(200).json({
      success: true,
      data: appointment
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Get messages
// @route   GET /api/patient/messages
// @access  Private (Patient)
exports.getMessages = async (req, res, next) => {
  try {
    const patient = await Patient.findOne({ user: req.user._id })
      .populate('assignedDoctor');

    if (!patient || !patient.assignedDoctor) {
      console.log('❌ Pas de médecin assigné ou patient non trouvé');
      return res.status(200).json({
        success: true,
        count: 0,
        data: []
      });
    }

    console.log('📨 Chargement des messages pour:', req.user._id);

    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: patient.assignedDoctor.user },
        { sender: patient.assignedDoctor.user, receiver: req.user._id }
      ],
      isDeleted: false
    })
    .populate('sender', 'firstName lastName email role')
    .populate('receiver', 'firstName lastName email role')
    .sort({ createdAt: -1 });

    console.log('✅ Messages trouvés:', messages.length);

    // Mark received messages as read
    await Message.updateMany(
      { receiver: req.user._id, isRead: false, isDeleted: false },
      { isRead: true, readAt: new Date() }
    );

    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages
    });

  } catch (error) {
    console.error('Erreur getMessages:', error);
    next(error);
  }
};

// @desc    Send message to doctor
// @route   POST /api/patient/messages
// @access  Private (Patient)
exports.sendMessage = async (req, res, next) => {
  try {
    console.log('📨 [sendMessage] req.body:', req.body);
    console.log('📨 [sendMessage] req.user:', req.user._id);
    
    const { content, doctorEmail } = req.body;
    
    console.log('📨 [sendMessage] content reçu:', content);
    console.log('📨 [sendMessage] doctorEmail reçu:', doctorEmail);
    
    // Validation
    if (!content) {
      console.error('❌ [sendMessage] Contenu null/undefined');
      return res.status(400).json({
        success: false,
        message: 'Le contenu du message est requis'
      });
    }

    if (!content.trim()) {
      console.error('❌ [sendMessage] Contenu vide après trim');
      return res.status(400).json({
        success: false,
        message: 'Le message ne peut pas être vide'
      });
    }

    if (content.length > 5000) {
      console.error('❌ [sendMessage] Contenu trop long:', content.length);
      return res.status(400).json({
        success: false,
        message: 'Le message ne peut pas dépasser 5000 caractères'
      });
    }

    if (!doctorEmail || !doctorEmail.trim()) {
      console.error('❌ [sendMessage] Email du médecin manquant');
      return res.status(400).json({
        success: false,
        message: 'L\'email du médecin est requis'
      });
    }
    
    const patient = await Patient.findOne({ user: req.user._id });

    if (!patient) {
      console.error('❌ [sendMessage] Patient non trouvé');
      return res.status(404).json({
        success: false,
        message: 'Profil patient non trouvé'
      });
    }

    // Chercher le médecin par email
    const doctorUser = await User.findOne({ email: doctorEmail.trim() });
    console.log('📨 [sendMessage] Médecin trouvé:', doctorUser ? 'OUI' : 'NON');

    if (!doctorUser) {
      console.error('❌ [sendMessage] Médecin non trouvé avec cet email:', doctorEmail);
      return res.status(404).json({
        success: false,
        message: 'Médecin non trouvé avec cet email'
      });
    }

    if (doctorUser.role !== 'doctor') {
      console.error('❌ [sendMessage] Utilisateur n\'est pas un médecin');
      return res.status(400).json({
        success: false,
        message: 'Cet utilisateur n\'est pas un médecin'
      });
    }

    console.log('📤 [sendMessage] Création du message: Patient', req.user._id, '-> Docteur', doctorUser._id);

    // Find or create conversation
    const Conversation = require('../models/Conversation');
    let conversation = await Conversation.findOne({
      patient: req.user._id,
      doctor: doctorUser._id
    });

    if (!conversation) {
      console.log('📤 [sendMessage] Création d\'une nouvelle conversation');
      conversation = await Conversation.create({
        participants: [req.user._id, doctorUser._id],
        patient: req.user._id,
        doctor: doctorUser._id
      });
    }

    console.log('📤 [sendMessage] Conversation ID:', conversation._id);

    const message = await Message.create({
      conversation: conversation._id,
      sender: req.user._id,
      receiver: doctorUser._id,
      content: content.trim(),
      messageType: 'text',
      isRead: false
    });

    await message.populate('sender', 'firstName lastName email phone role');
    await message.populate('receiver', 'firstName lastName email phone role');

    // Update conversation last message
    conversation.lastMessage = message._id;
    conversation.lastMessageAt = new Date();
    await conversation.save();

    console.log('✅ [sendMessage] Message créé:', message._id);

    // Send email notification to doctor
    const emailService = require('../services/emailService');
    const patientUser = await User.findById(req.user._id);
    
    const emailContent = `
      <h2>📬 Nouveau Message du Patient</h2>
      <p><strong>De:</strong> ${patientUser.firstName} ${patientUser.lastName}</p>
      <p><strong>Email:</strong> ${patientUser.email}</p>
      <p><strong>Téléphone:</strong> ${patientUser.phone || 'Non renseigné'}</p>
      <hr/>
      <p><strong>Message:</strong></p>
      <p style="background:#f5f5f5; padding:15px; border-left:4px solid #667eea;">
        ${message.content}
      </p>
      <hr/>
      <p><a href="http://localhost:4200/doctor/messages" style="background:#667eea; color:white; padding:10px 20px; text-decoration:none; border-radius:5px;">Répondre</a></p>
    `;

    try {
      await emailService.sendEmail({
        to: doctorUser.email,
        subject: `📬 Nouveau message de ${patientUser.firstName} ${patientUser.lastName}`,
        html: emailContent
      });
      console.log('📧 Email envoyé au docteur:', doctorUser.email);
    } catch (emailErr) {
      console.error('⚠️ Erreur lors de l\'envoi de l\'email:', emailErr.message);
      // Ne pas échouer si l'email ne s'envoie pas
    }

    res.status(201).json({
      success: true,
      message: 'Message envoyé avec succès',
      data: message
    });

  } catch (error) {
    console.error('❌ Erreur sendMessage:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'envoi du message',
      error: error.message
    });
  }
};

// Helper function
function calculateEndTime(startTime, durationMinutes) {
  const [hours, minutes] = startTime.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes + durationMinutes;
  const endHours = Math.floor(totalMinutes / 60);
  const endMinutes = totalMinutes % 60;
  return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
}