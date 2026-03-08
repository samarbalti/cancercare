const { createTransporter } = require('../config/email');

class EmailService {
  constructor() {
    this.transporter = createTransporter();
  }

  async sendEmail(options) {
    try {
      const mailOptions = {
        from: `"CancerCare" <${process.env.EMAIL_FROM}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        attachments: options.attachments || []
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('📧 Email sent:', info.messageId);
      
      // En développement, afficher l'URL de prévisualisation Ethereal
      if (process.env.NODE_ENV === 'development' && info.ethereal) {
        console.log('📧 Preview URL:', nodemailer.getTestMessageUrl(info));
      }

      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Email error:', error);
      throw error;
    }
  }

  // Email de bienvenue
  async sendWelcomeEmail(to, firstName) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Bienvenue sur CancerCare, ${firstName}!</h2>
        <p>Nous sommes ravis de vous accompagner dans votre parcours de santé.</p>
        <p>Avec CancerCare, vous pouvez :</p>
        <ul>
          <li>Consulter votre dossier médical</li>
          <li>Prendre rendez-vous avec vos médecins</li>
          <li>Recevoir des rappels de médicaments</li>
          <li>Discuter avec notre assistant IA</li>
        </ul>
        <p>Si vous avez des questions, n'hésitez pas à nous contacter.</p>
        <p style="color: #6b7280; font-size: 12px;">Ceci est un email automatique, merci de ne pas y répondre.</p>
      </div>
    `;

    return this.sendEmail({
      to,
      subject: 'Bienvenue sur CancerCare',
      html
    });
  }

  // Email de réinitialisation de mot de passe
  async sendPasswordResetEmail(to, resetUrl) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Réinitialisation de mot de passe</h2>
        <p>Vous avez demandé à réinitialiser votre mot de passe.</p>
        <p>Cliquez sur le lien ci-dessous pour créer un nouveau mot de passe :</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">
          Réinitialiser mon mot de passe
        </a>
        <p>Ce lien expirera dans 30 minutes.</p>
        <p>Si vous n'avez pas fait cette demande, ignorez cet email.</p>
        <p style="color: #6b7280; font-size: 12px;">Pour des raisons de sécurité, ne partagez jamais ce lien.</p>
      </div>
    `;

    return this.sendEmail({
      to,
      subject: 'Réinitialisation de mot de passe - CancerCare',
      html
    });
  }

  // Notification nouveau médecin
  async notifyNewDoctorRegistration(doctor) {
    const html = `
      <div style="font-family: Arial, sans-serif;">
        <h2>Nouvelle inscription médecin</h2>
        <p>Un nouveau médecin s'est inscrit et attend votre validation :</p>
        <ul>
          <li><strong>Nom:</strong> Dr. ${doctor.firstName} ${doctor.lastName}</li>
          <li><strong>Email:</strong> ${doctor.email}</li>
          <li><strong>Spécialisation:</strong> ${doctor.specialization}</li>
        </ul>
        <p>Connectez-vous à l'administration pour valider ce compte.</p>
      </div>
    `;

    return this.sendEmail({
      to: process.env.ADMIN_EMAIL || 'admin@cancercare.com',
      subject: 'Nouvelle inscription médecin à valider',
      html
    });
  }

  // Rappel de rendez-vous
  async sendAppointmentReminder(to, appointment) {
    const html = `
      <div style="font-family: Arial, sans-serif;">
        <h2 style="color: #2563eb;">Rappel de rendez-vous</h2>
        <p>Bonjour,</p>
        <p>Nous vous rappelons votre rendez-vous :</p>
        <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p><strong>Date:</strong> ${new Date(appointment.date).toLocaleDateString('fr-FR')}</p>
          <p><strong>Heure:</strong> ${appointment.startTime}</p>
          <p><strong>Médecin:</strong> Dr. ${appointment.doctorName}</p>
          <p><strong>Motif:</strong> ${appointment.reason}</p>
        </div>
        <p>En cas d'empêchement, merci d'annuler au plus tôt.</p>
      </div>
    `;

    return this.sendEmail({
      to,
      subject: 'Rappel de rendez-vous - CancerCare',
      html
    });
  }

  // Rappel de médicament
  async sendMedicationReminder(to, medication) {
    const html = `
      <div style="font-family: Arial, sans-serif;">
        <h2 style="color: #059669;">Rappel de médicament</h2>
        <p>Il est temps de prendre votre médicament :</p>
        <div style="background-color: #ecfdf5; padding: 16px; border-radius: 8px; margin: 16px 0; border-left: 4px solid #059669;">
          <p><strong>Médicament:</strong> ${medication.name}</p>
          <p><strong>Dosage:</strong> ${medication.dosage}</p>
          <p><strong>Instructions:</strong> ${medication.instructions || 'Aucune instruction spéciale'}</p>
        </div>
      </div>
    `;

    return this.sendEmail({
      to,
      subject: 'Rappel de médicament - CancerCare',
      html
    });
  }

  // Alerte d'urgence au médecin
  async sendEmergencyAlert(doctorEmail, patient, emergencyDetails) {
    const html = `
      <div style="font-family: Arial, sans-serif;">
        <h2 style="color: #dc2626;">🚨 ALERTE URGENCE PATIENT</h2>
        <div style="background-color: #fef2f2; padding: 16px; border-radius: 8px; border: 2px solid #dc2626;">
          <p><strong>Patient:</strong> ${patient.firstName} ${patient.lastName}</p>
          <p><strong>Type d'urgence:</strong> ${emergencyDetails.type}</p>
          <p><strong>Sévérité:</strong> ${emergencyDetails.severity}</p>
          <p><strong>Détecté via:</strong> Chatbot IA</p>
          <p><strong>Heure:</strong> ${new Date().toLocaleString('fr-FR')}</p>
        </div>
        <p style="margin-top: 16px;">Veuillez contacter le patient dès que possible.</p>
        <a href="${process.env.FRONTEND_URL}/doctor/patients/${patient._id}" style="display: inline-block; padding: 12px 24px; background-color: #dc2626; color: white; text-decoration: none; border-radius: 6px;">
          Voir le dossier patient
        </a>
      </div>
    `;

    return this.sendEmail({
      to: doctorEmail,
      subject: '🚨 ALERTE URGENCE - Action requise',
      html,
      priority: 'high'
    });
  }

  // Nouveau message
  async sendNewMessageNotification(to, from, messagePreview) {
    const html = `
      <div style="font-family: Arial, sans-serif;">
        <h2>Nouveau message</h2>
        <p>Vous avez reçu un message de <strong>Dr. ${from}</strong> :</p>
        <blockquote style="background-color: #f3f4f6; padding: 12px; border-left: 4px solid #2563eb; margin: 16px 0;">
          "${messagePreview.substring(0, 100)}${messagePreview.length > 100 ? '...' : ''}"
        </blockquote>
        <a href="${process.env.FRONTEND_URL}/messages" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px;">
          Lire le message
        </a>
      </div>
    `;

    return this.sendEmail({
      to,
      subject: 'Nouveau message - CancerCare',
      html
    });
  }

  // Notification au médecin d'un nouveau rendez-vous en attente
  async sendNewAppointmentNotification(doctorEmail, doctorName, patient, appointment) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Nouveau rendez-vous en attente</h2>
        <p>Dr. ${doctorName},</p>
        <p>Un nouveau rendez-vous a été créé et attend votre confirmation :</p>
        
        <div style="background-color: #f0f9ff; padding: 20px; border-left: 4px solid #2563eb; border-radius: 8px; margin: 20px 0;">
          <p><strong style="color: #1e40af;">Patient :</strong> ${patient.firstName} ${patient.lastName}</p>
          <p><strong style="color: #1e40af;">Email patient :</strong> ${patient.email}</p>
          <p><strong style="color: #1e40af;">Téléphone :</strong> ${patient.phone || 'Non renseigné'}</p>
          
          <hr style="border: none; border-top: 1px solid #cbd5e1; margin: 15px 0;">
          
          <p><strong style="color: #1e40af;">📅 Date :</strong> ${new Date(appointment.date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <p><strong style="color: #1e40af;">🕐 Heure :</strong> ${appointment.startTime} - ${appointment.endTime}</p>
          <p><strong style="color: #1e40af;">📝 Raison :</strong> ${appointment.reason}</p>
          
          ${appointment.symptoms && appointment.symptoms.length > 0 ? `
          <p><strong style="color: #1e40af;">🔍 Symptômes :</strong></p>
          <ul>
            ${appointment.symptoms.map(s => `<li>${s}</li>`).join('')}
          </ul>
          ` : ''}
          
          <p><strong style="color: #1e40af;">🏥 Type :</strong> ${appointment.type}</p>
          ${appointment.isVirtual ? '<p><strong style="color: #1e40af;">💻 Mode :</strong> En ligne</p>' : ''}
        </div>

        <div style="background-color: #fff7ed; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;">⏳ <strong>Action requise :</strong> Veuillez confirmer ou refuser ce rendez-vous.</p>
        </div>

        <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
          Connectez-vous à CancerCare pour gérer vos rendez-vous.
        </p>
      </div>
    `;

    return this.sendEmail({
      to: doctorEmail,
      subject: `Nouveau rendez-vous en attente de confirmation - ${patient.firstName} ${patient.lastName}`,
      html
    });
  }

  // Notification au patient que son rendez-vous a été confirmé
  async sendAppointmentConfirmedNotification(patientEmail, patientName, doctorName, appointment) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #059669;">✅ Rendez-vous confirmé !</h2>
        <p>Bonjour ${patientName},</p>
        <p>Votre rendez-vous a été confirmé par Dr. ${doctorName}.</p>
        
        <div style="background-color: #ecfdf5; padding: 20px; border-left: 4px solid #059669; border-radius: 8px; margin: 20px 0;">
          <p><strong style="color: #065f46;">🏥 Médecin :</strong> Dr. ${doctorName}</p>
          <p><strong style="color: #065f46;">📅 Date :</strong> ${new Date(appointment.date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <p><strong style="color: #065f46;">🕐 Heure :</strong> ${appointment.startTime}</p>
          <p><strong style="color: #065f46;">📝 Raison :</strong> ${appointment.reason}</p>
          ${appointment.isVirtual ? '<p><strong style="color: #065f46;">💻 Mode :</strong> Consultation en ligne</p>' : '<p><strong style="color: #065f46;">📍 Lieu :</strong> Au cabinet du médecin</p>'}
        </div>

        <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #d97706;">
          <p style="margin: 0;"><strong>⏰ Rappel :</strong> Arrivez quelques minutes en avance. Une notification vous sera envoyée avant la consultation.</p>
        </div>

        <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
          Vous pouvez annuler ce rendez-vous jusqu'à 24 heures avant la date prévue.
        </p>
      </div>
    `;

    return this.sendEmail({
      to: patientEmail,
      subject: `Rendez-vous confirmé - Dr. ${doctorName}`,
      html
    });
  }
}

module.exports = new EmailService();