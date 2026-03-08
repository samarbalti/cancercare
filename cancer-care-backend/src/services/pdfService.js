const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class PDFService {
  constructor() {
    this.fonts = {
      regular: 'Helvetica',
      bold: 'Helvetica-Bold',
      italic: 'Helvetica-Oblique'
    };
  }

  // Générer un dossier médical en PDF
  async generateMedicalRecordPDF(medicalRecord, patient, doctor) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const filename = `dossier-medical-${patient._id}-${Date.now()}.pdf`;
        const filepath = path.join(__dirname, '../../uploads/', filename);
        
        const stream = fs.createWriteStream(filepath);
        doc.pipe(stream);

        // En-tête
        this._addHeader(doc, 'DOSSIER MÉDICAL');

        // Informations patient
        doc.fontSize(14).font(this.fonts.bold).text('INFORMATIONS PATIENT', 50, 120);
        doc.moveDown();
        
        doc.fontSize(10).font(this.fonts.regular);
        doc.text(`Nom: ${patient.user.firstName} ${patient.user.lastName}`);
        doc.text(`Date de naissance: ${patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString('fr-FR') : 'Non renseignée'}`);
        doc.text(`Groupe sanguin: ${patient.bloodType || 'Non renseigné'}`);
        doc.text(`Téléphone: ${patient.user.phone || 'Non renseigné'}`);
        doc.moveDown();

        // Informations médecin
        doc.fontSize(14).font(this.fonts.bold).text('MÉDECIN TRAITANT', 50, doc.y);
        doc.moveDown();
        
        doc.fontSize(10).font(this.fonts.regular);
        doc.text(`Dr. ${doctor.user.firstName} ${doctor.user.lastName}`);
        doc.text(`Spécialisation: ${doctor.specialization}`);
        doc.text(`Téléphone: ${doctor.user.phone || 'Non renseigné'}`);
        doc.moveDown(2);

        // Diagnostic
        doc.fontSize(14).font(this.fonts.bold).text('DIAGNOSTIC', 50, doc.y);
        doc.moveDown();
        
        doc.fontSize(10).font(this.fonts.regular);
        doc.text(`Principal: ${medicalRecord.diagnosis.primary}`);
        if (medicalRecord.diagnosis.secondary.length > 0) {
          doc.text(`Secondaires: ${medicalRecord.diagnosis.secondary.join(', ')}`);
        }
        doc.moveDown();

        // Symptômes
        if (medicalRecord.symptoms.length > 0) {
          doc.fontSize(14).font(this.fonts.bold).text('SYMPTÔMES', 50, doc.y);
          doc.moveDown();
          
          medicalRecord.symptoms.forEach(symptom => {
            doc.fontSize(10).font(this.fonts.regular);
            doc.text(`• ${symptom.name} (${symptom.severity}) - ${symptom.duration}`);
          });
          doc.moveDown();
        }

        // Signes vitaux
        if (medicalRecord.vitalSigns) {
          doc.fontSize(14).font(this.fonts.bold).text('SIGNES VITAUX', 50, doc.y);
          doc.moveDown();
          
          const vs = medicalRecord.vitalSigns;
          doc.fontSize(10).font(this.fonts.regular);
          if (vs.bloodPressure) doc.text(`Tension: ${vs.bloodPressure.systolic}/${vs.bloodPressure.diastolic} mmHg`);
          if (vs.heartRate) doc.text(`Fréquence cardiaque: ${vs.heartRate} bpm`);
          if (vs.temperature) doc.text(`Température: ${vs.temperature}°C`);
          if (vs.weight) doc.text(`Poids: ${vs.weight} kg`);
          if (vs.bmi) doc.text(`IMC: ${vs.bmi}`);
          doc.moveDown();
        }

        // Traitements
        if (medicalRecord.treatments.length > 0) {
          doc.addPage();
          doc.fontSize(14).font(this.fonts.bold).text('TRAITEMENTS', 50, 50);
          doc.moveDown();
          
          medicalRecord.treatments.forEach(treatment => {
            doc.fontSize(11).font(this.fonts.bold).text(`${treatment.name} (${treatment.type})`);
            doc.fontSize(10).font(this.fonts.regular);
            doc.text(`Protocole: ${treatment.protocol || 'Non spécifié'}`);
            doc.text(`Période: ${new Date(treatment.startDate).toLocaleDateString('fr-FR')} - ${treatment.endDate ? new Date(treatment.endDate).toLocaleDateString('fr-FR') : 'En cours'}`);
            doc.text(`Cycles: ${treatment.completedCycles}/${treatment.cycles}`);
            doc.text(`Réponse: ${treatment.response}`);
            if (treatment.sideEffects.length > 0) {
              doc.text(`Effets secondaires: ${treatment.sideEffects.join(', ')}`);
            }
            doc.moveDown();
          });
        }

        // Pied de page
        doc.fontSize(8).font(this.fonts.italic);
        doc.text(
          `Document généré le ${new Date().toLocaleString('fr-FR')} - CancerCare`,
          50,
          doc.page.height - 50,
          { align: 'center' }
        );

        doc.end();

        stream.on('finish', () => {
          resolve({
            filename,
            filepath,
            url: `/uploads/${filename}`
          });
        });

        stream.on('error', reject);

      } catch (error) {
        reject(error);
      }
    });
  }

  // Générer une ordonnance PDF
  async generatePrescriptionPDF(prescription, patient, doctor) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        const filename = `ordonnance-${prescription.prescriptionNumber}.pdf`;
        const filepath = path.join(__dirname, '../../uploads/', filename);
        
        const stream = fs.createWriteStream(filepath);
        doc.pipe(stream);

        // Cadre médecin (en haut à gauche)
        doc.fontSize(10).font(this.fonts.regular);
        doc.text(`Dr. ${doctor.user.firstName} ${doctor.user.lastName}`, 50, 50);
        doc.text(doctor.specialization);
        doc.text(`N° RPPS: ${doctor.licenseNumber}`);
        if (doctor.hospital) doc.text(doctor.hospital);
        doc.text(doctor.user.phone || '');
        doc.text(doctor.user.email);

        // Date (en haut à droite)
        doc.fontSize(10);
        doc.text(
          `Le ${new Date().toLocaleDateString('fr-FR')}`,
          400,
          50,
          { align: 'right' }
        );

        // Titre
        doc.moveDown(4);
        doc.fontSize(18).font(this.fonts.bold).text('ORDONNANCE', { align: 'center' });
        doc.moveDown();

        // Patient
        doc.fontSize(11).font(this.fonts.bold).text('Patient:');
        doc.fontSize(10).font(this.fonts.regular);
        doc.text(`${patient.user.firstName} ${patient.user.lastName}`);
        if (patient.dateOfBirth) {
          doc.text(`Né(e) le: ${new Date(patient.dateOfBirth).toLocaleDateString('fr-FR')}`);
        }
        doc.moveDown(2);

        // Diagnostic
        doc.fontSize(11).font(this.fonts.bold).text(`Diagnostic: ${prescription.diagnosis}`);
        doc.moveDown(2);

        // Médicaments
        prescription.medications.forEach((med, index) => {
          doc.fontSize(11).font(this.fonts.bold).text(`${index + 1}. ${med.name} ${med.dosage}`);
          doc.fontSize(10).font(this.fonts.regular);
          doc.text(`   ${med.quantity} boîte(s) - ${med.frequency} pendant ${med.duration}`);
          if (med.instructions) {
            doc.text(`   ${med.instructions}`);
          }
          if (med.takeWithFood) doc.text('   À prendre pendant les repas');
          if (med.takeBeforeBed) doc.text('   À prendre avant le coucher');
          doc.moveDown();
        });

        // Signature
        doc.moveDown(4);
        doc.fontSize(10).font(this.fonts.italic);
        doc.text('Signature et cachet du médecin:', 350, doc.y);
        doc.moveDown(3);
        doc.text('_______________________', 350);

        // Pied de page
        doc.fontSize(8);
        doc.text(
          `Ordonnance n° ${prescription.prescriptionNumber} - CancerCare`,
          50,
          doc.page.height - 100,
          { align: 'center' }
        );

        doc.end();

        stream.on('finish', () => {
          resolve({
            filename,
            filepath,
            url: `/uploads/${filename}`
          });
        });

        stream.on('error', reject);

      } catch (error) {
        reject(error);
      }
    });
  }

  // Générer liste de patients pour médecin
  async generatePatientListPDF(patients, doctor) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const filename = `liste-patients-${Date.now()}.pdf`;
        const filepath = path.join(__dirname, '../../uploads/', filename);
        
        const stream = fs.createWriteStream(filepath);
        doc.pipe(stream);

        this._addHeader(doc, 'LISTE DES PATIENTS');
        
        doc.fontSize(12).font(this.fonts.regular);
        doc.text(`Dr. ${doctor.user.firstName} ${doctor.user.lastName}`);
        doc.text(`Généré le: ${new Date().toLocaleDateString('fr-FR')}`);
        doc.moveDown(2);

        // Tableau
        const tableTop = doc.y;
        const colWidths = [150, 100, 100, 150];
        
        // En-têtes
        doc.fontSize(10).font(this.fonts.bold);
        doc.text('Nom', 50, tableTop);
        doc.text('Téléphone', 50 + colWidths[0], tableTop);
        doc.text('Dernière visite', 50 + colWidths[0] + colWidths[1], tableTop);
        doc.text('Prochain RDV', 50 + colWidths[0] + colWidths[1] + colWidths[2], tableTop);
        
        doc.moveDown();
        let y = doc.y;

        // Lignes
        doc.fontSize(9).font(this.fonts.regular);
        patients.forEach((patient, index) => {
          if (y > 700) {
            doc.addPage();
            y = 50;
          }
          
          doc.text(`${patient.user.firstName} ${patient.user.lastName}`, 50, y);
          doc.text(patient.user.phone || '-', 50 + colWidths[0], y);
          doc.text(
            patient.lastVisit ? new Date(patient.lastVisit).toLocaleDateString('fr-FR') : '-',
            50 + colWidths[0] + colWidths[1],
            y
          );
          doc.text(
            patient.nextAppointment ? new Date(patient.nextAppointment).toLocaleDateString('fr-FR') : '-',
            50 + colWidths[0] + colWidths[1] + colWidths[2],
            y
          );
          
          y += 20;
        });

        doc.end();

        stream.on('finish', () => {
          resolve({
            filename,
            filepath,
            url: `/uploads/${filename}`
          });
        });

        stream.on('error', reject);

      } catch (error) {
        reject(error);
      }
    });
  }

  _addHeader(doc, title) {
    doc.fontSize(20).font(this.fonts.bold).fillColor('#2563eb');
    doc.text('CancerCare', 50, 50);
    doc.fontSize(12).font(this.fonts.regular).fillColor('#000000');
    doc.text('Plateforme de gestion de santé', 50, 75);
    
    doc.fontSize(16).font(this.fonts.bold);
    doc.text(title, 50, 100);
    
    doc.moveTo(50, 115).lineTo(550, 115).stroke();
  }
}

module.exports = new PDFService();