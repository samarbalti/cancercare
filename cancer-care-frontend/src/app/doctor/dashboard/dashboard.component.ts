import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { SocketService } from '../../services/socket.service';

@Component({
  selector: 'app-doctor-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DoctorDashboardComponent implements OnInit, OnDestroy {
  activeSection = 'overview';
  
  stats = {
    patients: 0,
    appointmentsToday: 0,
    pendingAppointments: 0,
    alerts: 0
  };
  
  patients: any[] = [];
  todayAppointments: any[] = [];
  alerts: any[] = [];
  messages: any[] = [];
  realTimeAlerts: any[] = [];
  
  // Formulaires
  selectedPatient: any = null;
  showAddPatientModal = false;
  showMedicalRecordModal = false;
  showPrescriptionModal = false;
  
  medicalRecordForm = {
    diagnosis: '',
    treatment: '',
    notes: ''
  };
  
  newPatient = {
    email: ''
  };
  
  newPrescription = {
    patientId: '',
    diagnosis: '',
    medications: [{ name: '', dosage: '', frequency: '', duration: '' }]
  };

  constructor(
    private http: HttpClient,
    private router: Router,
    private socketService: SocketService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadDashboard();
    this.initializeSocket();
  }

  ngOnDestroy() {
    this.socketService.disconnect();
  }

  initializeSocket() {
    const userId = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!).id : null;
    if (userId) {
      this.socketService.connect(userId);

      // Écouter nouvelles alertes
      this.socketService.on('new-alert').subscribe((alert: any) => {
        this.realTimeAlerts.unshift(alert);
        this.stats.alerts++;
        this.cdr.detectChanges();
        this.showNotification('Nouvelle alerte!', alert.message);
      });

      // Écouter patient en ligne
      this.socketService.on('patient-online').subscribe((patientId: any) => {
        console.log('Patient en ligne:', patientId);
      });
    }
  }

  showNotification(title: string, message: string) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body: message });
    }
  }

  loadDashboard() {
    this.http.get(`${environment.apiUrl}/doctor/dashboard`).subscribe({
      next: (res: any) => {
        this.stats = res.data.stats;
        this.patients = res.data.patients || [];
        this.todayAppointments = res.data.todayAppointments || [];
        this.alerts = res.data.alerts || [];
      },
      error: (err) => console.error('Erreur:', err)
    });
  }

  showSection(section: string) {
    this.activeSection = section;
    if (section === 'patients') this.loadPatients();
    if (section === 'appointments') this.loadAppointments();
    if (section === 'messages') this.loadMessages();
  }

  loadPatients() {
    this.http.get(`${environment.apiUrl}/doctor/patients`).subscribe({
      next: (res: any) => this.patients = res.data || [],
      error: (err) => console.error('Erreur:', err)
    });
  }

  loadAppointments() {
    this.http.get(`${environment.apiUrl}/doctor/appointments`).subscribe({
      next: (res: any) => this.todayAppointments = res.data || [],
      error: (err) => console.error('Erreur:', err)
    });
  }

  loadMessages() {
    this.http.get(`${environment.apiUrl}/doctor/messages`).subscribe({
      next: (res: any) => this.messages = res.data || [],
      error: (err) => console.error('Erreur:', err)
    });
  }

  addPatient() {
    this.http.post(`${environment.apiUrl}/doctor/patients`, this.newPatient).subscribe({
      next: (res: any) => {
        alert(res.message || 'Patient ajouté avec succès!');
        this.showAddPatientModal = false;
        this.resetNewPatient();
        this.loadDashboard();
        if (this.activeSection === 'patients') {
          this.loadPatients();
        }
      },
      error: (err) => {
        console.error('Erreur:', err);
        const message = err.error?.message || 'Erreur lors de l\'ajout du patient';
        alert('Erreur: ' + message);
      }
    });
  }

  viewPatient(patient: any) {
    this.selectedPatient = patient;
    this.medicalRecordForm = {
      diagnosis: '',
      treatment: '',
      notes: ''
    };
    this.showMedicalRecordModal = true;
  }

  updateMedicalRecord() {
    if (!this.medicalRecordForm.diagnosis && !this.medicalRecordForm.treatment && !this.medicalRecordForm.notes) {
      alert('Veuillez remplir au moins un champ');
      return;
    }

    this.http.put(`${environment.apiUrl}/doctor/patients/${this.selectedPatient._id}/medical-record`, this.medicalRecordForm).subscribe({
      next: () => {
        alert('Dossier médical mis à jour!');
        this.showMedicalRecordModal = false;
        this.medicalRecordForm = { diagnosis: '', treatment: '', notes: '' };
      },
      error: (err) => alert('Erreur: ' + (err.error?.message || 'Erreur serveur'))
    });
  }

  prescribeTreatment(patient: any) {
    this.newPrescription.patientId = patient._id;
    this.showPrescriptionModal = true;
  }

  savePrescription() {
    if (!this.newPrescription.patientId) {
      alert('Erreur: Patient non sélectionné');
      return;
    }
    if (!this.newPrescription.diagnosis) {
      alert('Erreur: Diagnostic requis');
      return;
    }
    if (this.newPrescription.medications.length === 0 || !this.newPrescription.medications[0].name) {
      alert('Erreur: Au moins un médicament requis');
      return;
    }

    console.log('Envoi prescription:', JSON.stringify(this.newPrescription, null, 2));

    this.http.post(`${environment.apiUrl}/doctor/prescriptions`, this.newPrescription).subscribe({
      next: () => {
        alert('Prescription créée avec succès!');
        this.showPrescriptionModal = false;
        this.resetPrescription();
      },
      error: (err) => {
        console.error('Erreur prescription:', err);
        console.error('Détails erreur:', err.error);
        alert('Erreur: ' + (err.error?.message || 'Erreur serveur'));
      }
    });
  }

  addMedication() {
    this.newPrescription.medications.push({ name: '', dosage: '', frequency: '', duration: '' });
  }

  removeMedication(index: number) {
    this.newPrescription.medications.splice(index, 1);
  }

  exportPatients() {
    window.open(`${environment.apiUrl}/doctor/patients/export`, '_blank');
  }

  resetNewPatient() {
    this.newPatient = { email: '' };
  }

  resetPrescription() {
    this.newPrescription = {
      patientId: '', diagnosis: '',
      medications: [{ name: '', dosage: '', frequency: '', duration: '' }]
    };
  }

  testAlert() {
    this.http.post(`${environment.apiUrl}/doctor/test-alert`, {}).subscribe({
      next: (res: any) => {
        console.log('✅ Alerte test envoyée:', res);
        alert('Alerte test créée! Vérifiez la section Alertes.');
      },
      error: (err) => {
        console.error('❌ Erreur:', err);
        alert('Erreur: ' + (err.error?.message || 'Impossible de créer l\'alerte'));
      }
    });
  }

  deletePatient(patient: any) {
    if (confirm(`Supprimer ${patient.user?.firstName} ${patient.user?.lastName} ?`)) {
      this.http.delete(`${environment.apiUrl}/doctor/patients/${patient._id}`).subscribe({
        next: () => {
          alert('Patient supprimé!');
          this.loadPatients();
        },
        error: (err) => alert('Erreur: ' + (err.error?.message || 'Erreur'))
      });
    }
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}
