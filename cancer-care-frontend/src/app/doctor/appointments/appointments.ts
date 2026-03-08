import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DoctorService } from '../../services/doctor.service';

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './appointments.html',
  styleUrl: './appointments.css',
})
export class Appointments implements OnInit {
  appointments: any[] = [];
  pendingAppointments: any[] = [];
  confirmedAppointments: any[] = [];
  completedAppointments: any[] = [];

  activeTab: string = 'pending';
  loading: boolean = false;
  error: string = '';
  success: string = '';
  selectedAppointment: any = null;
  confirmationModalOpen: boolean = false;

  constructor(private doctorService: DoctorService) {}

  ngOnInit() {
    this.loadAppointments();
  }

  loadAppointments() {
    this.loading = true;
    this.error = '';

    this.doctorService.getAppointments().subscribe({
      next: (response: any) => {
        this.appointments = response.data || [];
        this.filterAppointments();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading appointments:', err);
        this.error = 'Erreur lors du chargement des rendez-vous';
        this.loading = false;
      }
    });
  }

  filterAppointments() {
    this.pendingAppointments = this.appointments.filter(apt => apt.status === 'pending');
    this.confirmedAppointments = this.appointments.filter(apt => apt.status === 'confirmed');
    this.completedAppointments = this.appointments.filter(apt => apt.status === 'completed' || apt.status === 'no-show');
  }

  switchTab(tab: string) {
    this.activeTab = tab;
    this.error = '';
    this.success = '';
  }

  openConfirmationModal(appointment: any) {
    this.selectedAppointment = appointment;
    this.confirmationModalOpen = true;
  }

  closeConfirmationModal() {
    this.selectedAppointment = null;
    this.confirmationModalOpen = false;
  }

  confirmAppointment() {
    if (!this.selectedAppointment) return;

    this.loading = true;
    this.error = '';

    const appointmentId = this.selectedAppointment._id;

    this.doctorService.confirmAppointment(appointmentId).subscribe({
      next: (response: any) => {
        this.success = 'Rendez-vous confirmé avec succès!';
        this.loading = false;
        this.closeConfirmationModal();

        setTimeout(() => {
          this.loadAppointments();
        }, 1000);
      },
      error: (err) => {
        console.error('Error confirming appointment:', err);
        this.error = err.error?.message || 'Erreur lors de la confirmation du rendez-vous';
        this.loading = false;
      }
    });
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

  getAppointmentsByStatus(status: string): any[] {
    return this.appointments.filter(apt => apt.status === status);
  }
}
