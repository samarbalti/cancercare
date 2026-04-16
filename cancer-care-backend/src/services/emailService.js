const nodemailer = require('nodemailer');
const { createTransporter } = require('../config/email');

class EmailService {
  constructor() {
    this.transporter = createTransporter();
  }

  async sendEmail(options) {
    try {
      const info = await this.transporter.sendMail({
        from: `"CancerCare" <${process.env.EMAIL_FROM}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        attachments: options.attachments || []
      });
      console.log('📧 Email sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Email error:', error.message);
      throw error;
    }
  }

  async sendWelcomeEmail(to, firstName) {
    return this.sendEmail({
      to,
      subject: 'Bienvenue sur CancerCare',
      html: `<div style="font-family:Arial;max-width:600px;">
        <h2 style="color:#2563eb;">Bienvenue sur CancerCare, ${firstName}!</h2>
        <p>Nous sommes ravis de vous accompagner dans votre parcours de santé.</p>
      </div>`
    });
  }

  async sendPasswordResetEmail(to, resetUrl) {
    return this.sendEmail({
      to,
      subject: 'Réinitialisation de mot de passe - CancerCare',
      html: `<div style="font-family:Arial;max-width:600px;">
        <h2 style="color:#dc2626;">Réinitialisation de mot de passe</h2>
        <p>Cliquez sur le lien ci-dessous pour créer un nouveau mot de passe :</p>
        <a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#2563eb;color:white;text-decoration:none;border-radius:6px;">
          Réinitialiser mon mot de passe
        </a>
        <p>Ce lien expirera dans 30 minutes.</p>
      </div>`
    });
  }

  async notifyNewDoctorRegistration(doctor) {
    return this.sendEmail({
      to: process.env.ADMIN_EMAIL || 'admin@cancercare.com',
      subject: 'Nouvelle inscription médecin à valider',
      html: `<div style="font-family:Arial;">
        <h2>Nouvelle inscription médecin</h2>
        <p>Dr. ${doctor.firstName} ${doctor.lastName} (${doctor.email}) attend votre validation.</p>
        <p>Spécialisation: ${doctor.specialization}</p>
      </div>`
    });
  }

  async sendAppointmentReminder(to, appointment) {
    return this.sendEmail({
      to,
      subject: 'Rappel de rendez-vous - CancerCare',
      html: `<div style="font-family:Arial;">
        <h2 style="color:#2563eb;">Rappel de rendez-vous</h2>
        <p>Date: ${new Date(appointment.date).toLocaleDateString('fr-FR')}</p>
        <p>Heure: ${appointment.startTime}</p>
        <p>Médecin: Dr. ${appointment.doctorName}</p>
      </div>`
    });
  }

  async sendEmergencyAlert(doctorEmail, patient, emergencyDetails) {
    return this.sendEmail({
      to: doctorEmail,
      subject: '🚨 ALERTE URGENCE - Action requise',
      html: `<div style="font-family:Arial;">
        <h2 style="color:#dc2626;">🚨 ALERTE URGENCE PATIENT</h2>
        <div style="background:#fef2f2;padding:16px;border-radius:8px;border:2px solid #dc2626;">
          <p><strong>Patient:</strong> ${patient.firstName} ${patient.lastName}</p>
          <p><strong>Type:</strong> ${emergencyDetails.type}</p>
          <p><strong>Sévérité:</strong> ${emergencyDetails.severity}</p>
          <p><strong>Heure:</strong> ${new Date().toLocaleString('fr-FR')}</p>
        </div>
      </div>`
    });
  }

  async sendEmail_direct(options) {
    return this.sendEmail(options);
  }
}

module.exports = new EmailService();
