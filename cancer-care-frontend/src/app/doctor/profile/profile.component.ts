import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-doctor-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class DoctorProfileComponent implements OnInit {
  profile: any = null;
  editMode = false;
  loading = false;
  message = '';
  error = '';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    this.loading = true;
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get('http://localhost:5000/api/doctor/profile', { headers })
      .subscribe({
        next: (res: any) => {
          this.profile = res.data;
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Erreur lors du chargement du profil';
          this.loading = false;
        }
      });
  }

  toggleEdit() {
    this.editMode = !this.editMode;
    this.message = '';
    this.error = '';
  }

  saveProfile() {
    this.loading = true;
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    const updateData = {
      specialization: this.profile.specialization,
      hospital: this.profile.hospital,
      department: this.profile.department,
      bio: this.profile.bio,
      availability: this.profile.availability,
      appointmentDuration: this.profile.appointmentDuration,
      languages: this.profile.languages,
      consultationFee: this.profile.consultationFee
    };

    this.http.put('http://localhost:5000/api/doctor/profile', updateData, { headers })
      .subscribe({
        next: (res: any) => {
          this.profile = res.data;
          this.editMode = false;
          this.message = 'Profil mis à jour avec succès';
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Erreur lors de la mise à jour';
          this.loading = false;
        }
      });
  }

  addAvailability() {
    if (!this.profile.availability) {
      this.profile.availability = [];
    }
    this.profile.availability.push({
      day: 'Monday',
      startTime: '09:00',
      endTime: '17:00'
    });
  }

  removeAvailability(index: number) {
    this.profile.availability.splice(index, 1);
  }
}
