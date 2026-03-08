import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PatientService } from '../../services/patient.service';
import { DoctorService } from '../../services/doctor.service';

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './appointments.html',
  styleUrls: ['./appointments.css']
})
export class Appointments implements OnInit {
  // View modes
  currentView: 'list' | 'book' = 'list';

  // Data
  myAppointments: any[] = [];
  doctors: any[] = [];
  availableSlots: any[] = [];

  // Form data
  selectedDoctor: any = null;
  selectedDate: string = '';
  selectedTime: string = '';
  appointmentType: string = 'consultation';
  reason: string = '';
  symptoms: string[] = [];
  symptomInput: string = '';
  isVirtual: boolean = false;
  cancellationReason: string = '';

  // UI states
  loading: boolean = false;
  loadingSlots: boolean = false;
  error: string = '';
  success: string = '';
  selectedCancelAppointment: any = null;

  constructor(
    private patientService: PatientService,
    private doctorService: DoctorService
  ) {}

  ngOnInit() {
    this.loadMyAppointments();
    this.loadDoctors();
  }

  loadMyAppointments() {
    this.loading = true;
    this.patientService.getAppointments().subscribe({
      next: (response: any) => {
        this.myAppointments = response.data || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading appointments:', err);
        this.error = 'Erreur lors du chargement des rendez-vous';
        this.loading = false;
      }
    });
  }

  loadDoctors() {
    this.doctorService.getDoctors().subscribe({
      next: (response: any) => {
        this.doctors = response.data || [];
      },
      error: (err) => {
        console.error('Error loading doctors:', err);
      }
    });
  }

  selectDoctor(doctor: any) {
    this.selectedDoctor = doctor;
    this.availableSlots = [];
    this.selectedTime = '';
  }

  loadAvailableSlots() {
    if (!this.selectedDoctor || !this.selectedDate) {
      this.error = 'Veuillez sélectionner un médecin et une date';
      return;
    }

    this.loadingSlots = true;
    this.error = '';

    const dateStr = new Date(this.selectedDate).toISOString().split('T')[0];

    this.patientService.getAvailableSlots(this.selectedDoctor._id, dateStr).subscribe({
      next: (response: any) => {
        this.availableSlots = response.data || [];
        this.loadingSlots = false;

        if (this.availableSlots.length === 0) {
          this.error = 'Aucun créneau disponible pour cette date';
        }
      },
      error: (err) => {
        console.error('Error loading slots:', err);
        this.error = 'Erreur lors du chargement des créneaux disponibles';
        this.loadingSlots = false;
      }
    });
  }

  addSymptom() {
    if (this.symptomInput.trim()) {
      this.symptoms.push(this.symptomInput.trim());
      this.symptomInput = '';
    }
  }

  removeSymptom(index: number) {
    this.symptoms.splice(index, 1);
  }

  bookAppointment() {
    // Validation
    if (!this.selectedDoctor) {
      this.error = 'Veuillez sélectionner un médecin';
      return;
    }
    if (!this.selectedDate) {
      this.error = 'Veuillez sélectionner une date';
      return;
    }
    if (!this.selectedTime) {
      this.error = 'Veuillez sélectionner une heure';
      return;
    }
    if (!this.reason.trim()) {
      this.error = 'Veuillez entrer la raison de la visite';
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = '';

    const appointmentData = {
      doctorId: this.selectedDoctor._id,
      date: new Date(this.selectedDate).toISOString(),
      startTime: this.selectedTime,
      reason: this.reason.trim(),
      symptoms: this.symptoms,
      type: this.appointmentType,
      isVirtual: this.isVirtual
    };

    this.patientService.createAppointment(appointmentData).subscribe({
      next: (response: any) => {
        this.success = 'Rendez-vous créé avec succès!';
        this.loading = false;

        // Reset form
        this.resetBookForm();

        // Reload appointments
        setTimeout(() => {
          this.currentView = 'list';
          this.loadMyAppointments();
        }, 1500);
      },
      error: (err) => {
        console.error('Error booking appointment:', err);
        this.error = err.error?.message || 'Erreur lors de la création du rendez-vous';
        this.loading = false;
      }
    });
  }

  resetBookForm() {
    this.selectedDoctor = null;
    this.selectedDate = '';
    this.selectedTime = '';
    this.appointmentType = 'consultation';
    this.reason = '';
    this.symptoms = [];
    this.symptomInput = '';
    this.isVirtual = false;
    this.availableSlots = [];
  }

  openCancelDialog(appointment: any) {
    this.selectedCancelAppointment = appointment;
    this.cancellationReason = '';
  }

  closeCancelDialog() {
    this.selectedCancelAppointment = null;
    this.cancellationReason = '';
  }

  confirmCancelAppointment() {
    if (!this.selectedCancelAppointment) return;

    this.loading = true;
    this.error = '';
    this.success = '';

    this.patientService.cancelAppointment(
      this.selectedCancelAppointment._id,
      this.cancellationReason
    ).subscribe({
      next: (response: any) => {
        this.success = 'Rendez-vous annulé avec succès';
        this.loading = false;
        this.closeCancelDialog();

        setTimeout(() => {
          this.loadMyAppointments();
        }, 1000);
      },
      error: (err) => {
        console.error('Error cancelling appointment:', err);
        this.error = err.error?.message || 'Erreur lors de l\'annulation';
        this.loading = false;
      }
    });
  }

  switchView(view: 'list' | 'book') {
    this.currentView = view;
    this.error = '';
    this.success = '';

    if (view === 'book') {
      this.resetBookForm();
    }
  }

  getMinDate(): string {
    const today = new Date();
    today.setDate(today.getDate() + 1); // Next day minimum
    return today.toISOString().split('T')[0];
  }

  getMaxDate(): string {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 90); // 90 days in advance
    return maxDate.toISOString().split('T')[0];
  }

  getStatusLabel(status: string): string {
    const labels: any = {
      'pending': 'En attente',
      'confirmed': 'Confirmé',
      'cancelled': 'Annulé',
      'completed': 'Terminé',
      'no-show': 'Non présent'
    };
    return labels[status] || status;
  }

  getStatusClass(status: string): string {
    return `status-${status}`;
  }

  formatDate(date: any): string {
    const d = new Date(date);
    return d.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatTime(time: string): string {
    return time;
  }

  formatDateTime(date: any, time: string): string {
    return `${this.formatDate(date)} à ${this.formatTime(time)}`;
  }
}

