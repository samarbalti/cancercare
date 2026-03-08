const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');
const MedicalRecord = require('../models/MedicalRecord');
const Message = require('../models/Message');
const User = require('../models/User');
const Alert = require('../models/Alert');
const { sendNotification } = require('../services/socketService');

// @desc    Get doctor dashboard
// @route   GET /api/doctor/dashboard
// @access  Private (Doctor)
exports.getDashboard = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id });
    
    const stats = {
      patients: await Patient.countDocuments({ assignedDoctor: doctor._id }),
      appointmentsToday: await Appointment.countDocuments({
        doctor: doctor._id,
        date: {
          $gte: new Date().setHours(0, 0, 0, 0),
          $lt: new Date().setHours(23, 59, 59, 999)
        }
      }),
      pendingAppointments: await Appointment.countDocuments({
        doctor: doctor._id,
        status: 'pending'
      }),
      alerts: 0
    };

    const todayAppointments = await Appointment.find({
      doctor: doctor._id,
      date: {
        $gte: new Date().setHours(0, 0, 0, 0),
        $lt: new Date().setHours(23, 59, 59, 999)
      }
    }).populate('patient', 'user').sort({ date: 1 });

    const patients = await Patient.find({ assignedDoctor: doctor._id })
      .populate('user', 'firstName lastName email')
      .limit(10);

    res.status(200).json({
      success: true,
      data: {
        stats,
        todayAppointments,
        patients,
        alerts: []
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get doctor's patients
// @route   GET /api/doctor/patients
// @access  Private (Doctor)
exports.getPatients = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id });
    
    const patients = await Patient.find({ assignedDoctor: doctor._id })
      .populate('user', 'firstName lastName email phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: patients
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add new patient
// @route   POST /api/doctor/patients
// @access  Private (Doctor)
exports.addPatient = async (req, res, next) => {
  try {
    const { email } = req.body;
    const doctor = await Doctor.findOne({ user: req.user._id });

    const existingUser = await User.findOne({ email, role: 'patient' });
    
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'Aucun patient trouvé avec cet email. Le patient doit d\'abord créer son compte.'
      });
    }

    let patient = await Patient.findOne({ user: existingUser._id });
    
    if (!patient) {
      patient = await Patient.create({
        user: existingUser._id,
        assignedDoctor: doctor._id
      });
    } else {
      if (patient.assignedDoctor && patient.assignedDoctor.toString() === doctor._id.toString()) {
        return res.status(400).json({
          success: false,
          message: 'Ce patient est déjà dans votre liste'
        });
      }
      patient.assignedDoctor = doctor._id;
      await patient.save();
    }

    patient = await Patient.findById(patient._id).populate('user', 'firstName lastName email');

    return res.status(200).json({
      success: true,
      message: 'Patient assigné avec succès',
      data: patient
    });
  } catch (error) {
    console.error('Erreur ajout patient:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de l\'ajout du patient'
    });
  }
};

// @desc    Update patient medical record
// @route   PUT /api/doctor/patients/:id/medical-record
// @access  Private (Doctor)
exports.updateMedicalRecord = async (req, res, next) => {
  try {
    const { diagnosis, treatment, notes } = req.body;
    const doctor = await Doctor.findOne({ user: req.user._id });

    const record = await MedicalRecord.create({
      patient: req.params.id,
      doctor: doctor._id,
      diagnosis: {
        primary: diagnosis || 'Non spécifié'
      },
      treatments: treatment ? [{
        type: 'other',
        name: treatment,
        notes: treatment
      }] : [],
      notes: notes || '',
      recordType: 'follow-up'
    });

    res.status(200).json({
      success: true,
      data: record
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create prescription
// @route   POST /api/doctor/prescriptions
// @access  Private (Doctor)
exports.createPrescription = async (req, res, next) => {
  try {
    const { patientId, diagnosis, medications } = req.body;
    const doctor = await Doctor.findOne({ user: req.user._id });

    const prescription = await Prescription.create({
      patient: patientId,
      doctor: doctor._id,
      diagnosis,
      medications,
      date: new Date()
    });

    res.status(201).json({
      success: true,
      message: 'Prescription créée avec succès',
      data: prescription
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get doctor's appointments
// @route   GET /api/doctor/appointments
// @access  Private (Doctor)
exports.getAppointments = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id });
    
    const appointments = await Appointment.find({ doctor: doctor._id })
      .populate('patient', 'user')
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      data: appointments
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get doctor's messages
// @route   GET /api/doctor/messages
// @access  Private (Doctor)
exports.getMessages = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id });

    console.log('📨 Chargement des messages pour le docteur:', req.user._id);

    // Récupérer tous les messages reçus et envoyés par le docteur
    const messages = await Message.find({
      $or: [
        { sender: req.user._id },
        { receiver: req.user._id }
      ],
      isDeleted: false
    })
    .populate('sender', 'firstName lastName email phone role')
    .populate('receiver', 'firstName lastName email phone role')
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
    console.error('Erreur getMessages docteur:', error);
    next(error);
  }
};

// @desc    Send message to patient
// @route   POST /api/doctor/messages
// @access  Private (Doctor)
exports.sendMessage = async (req, res, next) => {
  try {
    const { content, patientId } = req.body;

    // Validation
    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Le message ne peut pas être vide'
      });
    }

    if (!patientId) {
      return res.status(400).json({
        success: false,
        message: 'ID du patient requis'
      });
    }

    const patient = await Patient.findById(patientId);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient non trouvé'
      });
    }

    console.log('📤 Création du message: Docteur', req.user._id, '-> Patient', patient.user);

    // Find or create conversation
    const Conversation = require('../models/Conversation');
    let conversation = await Conversation.findOne({
      patient: patient.user,
      doctor: req.user._id
    });

    if (!conversation) {
      console.log('📤 Création d\'une nouvelle conversation');
      conversation = await Conversation.create({
        participants: [patient.user, req.user._id],
        patient: patient.user,
        doctor: req.user._id
      });
    }

    const message = await Message.create({
      conversation: conversation._id,
      sender: req.user._id,
      receiver: patient.user,
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

    console.log('✅ Message créé:', message._id);

    // Send email notification to patient
    const emailService = require('../services/emailService');
    const User = require('../models/User');
    const doctorUser = await User.findById(req.user._id);

    const emailContent = `
      <h2>📬 Réponse de votre Médecin</h2>
      <p><strong>De:</strong> Dr. ${doctorUser.firstName} ${doctorUser.lastName}</p>
      <hr/>
      <p><strong>Message:</strong></p>
      <p style="background:#f5f5f5; padding:15px; border-left:4px solid #667eea;">
        ${message.content}
      </p>
      <hr/>
      <p><a href="http://localhost:4200/patient/dashboard" style="background:#667eea; color:white; padding:10px 20px; text-decoration:none; border-radius:5px;">Voir la conversation</a></p>
    `;

    try {
      await emailService.sendEmail({
        to: message.receiver.email,
        subject: `📬 Réponse de Dr. ${doctorUser.firstName} ${doctorUser.lastName}`,
        html: emailContent
      });
      console.log('📧 Email envoyé au patient:', message.receiver.email);
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
    console.error('❌ Erreur sendMessage docteur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'envoi du message',
      error: error.message
    });
  }
};

// @desc    Export patients list
// @route   GET /api/doctor/patients/export
// @access  Private (Doctor)
exports.exportPatients = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id });
    
    const patients = await Patient.find({ assignedDoctor: doctor._id })
      .populate('user', 'firstName lastName email phone');

    // TODO: Generate PDF using PDFKit
    res.status(200).json({
      success: true,
      message: 'Export PDF - À implémenter',
      data: patients
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete patient
// @route   DELETE /api/doctor/patients/:id
// @access  Private (Doctor)
exports.deletePatient = async (req, res, next) => {
  try {
    const patient = await Patient.findByIdAndDelete(req.params.id);
    
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient non trouvé'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Patient supprimé avec succès'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get doctor's alerts
// @route   GET /api/doctor/alerts
// @access  Private (Doctor)
exports.getAlerts = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id });
    
    const alerts = await Alert.find({ doctor: doctor._id, read: false })
      .populate('patient', 'user')
      .sort({ priority: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      data: alerts
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark alert as resolved
// @route   PUT /api/doctor/alerts/:id/resolve
// @access  Private (Doctor)
exports.resolveAlert = async (req, res, next) => {
  try {
    const alert = await Alert.findByIdAndUpdate(
      req.params.id,
      { read: true, resolvedAt: new Date(), resolvedBy: req.user._id },
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: alert
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    TEST - Create test alert
// @route   POST /api/doctor/test-alert
// @access  Private (Doctor)
exports.createTestAlert = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id });
    const patients = await Patient.find({ assignedDoctor: doctor._id }).limit(1);
    
    if (patients.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Aucun patient assigné'
      });
    }

    const alert = await Alert.create({
      patient: patients[0]._id,
      doctor: doctor._id,
      type: 'measure',
      priority: 'critical',
      title: 'Test Alerte Critique',
      message: 'Tension artérielle élevée: 18/12',
      data: { tension: '18/12', type: 'blood_pressure' }
    });

    // Envoyer notification temps réel
    sendNotification(req.user._id, 'new-alert', alert);

    res.status(201).json({
      success: true,
      message: 'Alerte test créée et envoyée!',
      data: alert
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = exports;
