const Notification = require('../models/Notification');
const emailService = require('./emailService');
const User = require('../models/User');

class NotificationService {
  // Créer une notification
  async createNotification(data) {
    try {
      const notification = await Notification.create(data);

      // Envoyer email si configuré
      if (data.channels?.email) {
        await this.sendEmailNotification(notification);
      }

      // TODO: Implémenter push notifications et SMS avec services externes

      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  // Envoyer notification par email selon le type
  async sendEmailNotification(notification) {
    const user = await User.findById(notification.user);
    if (!user) return;

    switch (notification.type) {
      case 'appointment_reminder':
        await emailService.sendAppointmentReminder(user.email, notification.data);
        break;
      case 'medication_reminder':
        await emailService.sendMedicationReminder(user.email, notification.data);
        break;
      case 'new_message':
        await emailService.sendNewMessageNotification(
          user.email,
          notification.data.from,
          notification.data.preview
        );
        break;
    }
  }

  // Rappel de rendez-vous (24h avant)
  async sendAppointmentReminders() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const dayAfter = new Date(tomorrow);
    dayAfter.setDate(dayAfter.getDate() + 1);

    const Appointment = require('../models/Appointment');
    const appointments = await Appointment.find({
      date: { $gte: tomorrow, $lt: dayAfter },
      status: 'confirmed',
      'remindersSent.dayBefore': false
    }).populate('patient doctor');

    for (const apt of appointments) {
      // Notification au patient
      await this.createNotification({
        user: apt.patient.user,
        type: 'appointment_reminder',
        title: 'Rappel de rendez-vous demain',
        message: `Vous avez un rendez-vous demain à ${apt.startTime} avec Dr. ${apt.doctor.user.lastName}`,
        priority: 'normal',
        data: {
          appointmentId: apt._id,
          url: `/patient/appointments/${apt._id}`
        },
        channels: { inApp: true, email: true }
      });

      // Marquer comme envoyé
      apt.remindersSent.dayBefore = true;
      await apt.save();
    }

    console.log(`📅 Sent ${appointments.length} appointment reminders`);
  }

  // Rappel de médicaments
  async sendMedicationReminders() {
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const Prescription = require('../models/Prescription');
    const prescriptions = await Prescription.find({
      status: 'active',
      'reminders.enabled': true,
      'reminders.times': currentTime
    }).populate('patient doctor');

    for (const pres of prescriptions) {
      for (const med of pres.medications) {
        await this.createNotification({
          user: pres.patient.user,
          type: 'medication_reminder',
          title: `Rappel: ${med.name}`,
          message: `Il est temps de prendre ${med.dosage} de ${med.name}`,
          priority: 'high',
          data: {
            prescriptionId: pres._id,
            medicationName: med.name
          },
          channels: { inApp: true, email: true, push: true }
        });
      }
    }
  }

  // Marquer toutes comme lues
    // Marquer toutes comme lues
  async markAllAsRead(userId) {
    await Notification.updateMany(
      { user: userId, isRead: false },
      { isRead: true, readAt: new Date() }
    );
  }

  // Obtenir notifications non lues
  async getUnreadCount(userId) {
    return await Notification.countDocuments({
      user: userId,
      isRead: false
    });
  }

  // Envoyer alerte d'urgence au médecin
  async sendEmergencyAlert(patient, doctor, emergencyDetails) {
    const notification = await this.createNotification({
      user: doctor.user,
      type: 'emergency_alert',
      title: '🚨 Alerte urgence patient',
      message: `${patient.user.firstName} ${patient.user.lastName} a signalé une urgence: ${emergencyDetails.type}`,
      priority: 'urgent',
      data: {
        patientId: patient._id,
        emergencyType: emergencyDetails.type,
        severity: emergencyDetails.severity,
        url: `/doctor/patients/${patient._id}`
      },
      channels: { inApp: true, email: true, push: true, sms: true }
    });

    // Envoyer email immédiatement
    await emailService.sendEmergencyAlert(
      doctor.user.email,
      patient.user,
      emergencyDetails
    );

    return notification;
  }

  // Nettoyer vieilles notifications
  async cleanupOldNotifications(days = 90) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    const result = await Notification.deleteMany({
      createdAt: { $lt: cutoff },
      isRead: true
    });

    console.log(`🧹 Cleaned up ${result.deletedCount} old notifications`);
    return result.deletedCount;
  }
}

module.exports = new NotificationService();