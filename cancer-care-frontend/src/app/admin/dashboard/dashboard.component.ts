import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  stats: any = {
    users: { total: 0, patients: 0, doctors: 0, admins: 0, newThisMonth: 0 },
    doctors: { total: 0, verified: 0, pending: 0 },
    appointments: { total: 0, today: 0, pending: 0 },
    medicalRecords: 0,
    emergencies: 0
  };
  recentUsers: any[] = [];
  pendingDoctors: any[] = [];

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadDashboard();
  }

  loadDashboard() {
    console.log('Chargement dashboard admin...');
    this.http.get(`${environment.apiUrl}/admin/dashboard`).subscribe({
      next: (res: any) => {
        console.log('Données reçues:', res);
        this.stats = res.data.stats;
        this.recentUsers = res.data.recentUsers;
        this.pendingDoctors = res.data.pendingDoctors;
        this.cdr.detectChanges();
        console.log('Affichage mis à jour');
      },
      error: (err) => {
        console.error('Erreur chargement dashboard:', err);
      }
    });
  }

  verifyDoctor(doctorId: string) {
    this.http.put(`${environment.apiUrl}/admin/doctors/${doctorId}/verify`, {}).subscribe({
      next: () => {
        alert('Médecin vérifié avec succès!');
        this.loadDashboard();
      }
    });
  }

  logout() {
    localStorage.clear();
    window.location.href = '/login';
  }
}
