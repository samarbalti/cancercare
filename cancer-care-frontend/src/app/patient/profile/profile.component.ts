import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { PatientHeaderComponent } from '../shared/header.component';
import { TranslationService } from '../services/translation.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, PatientHeaderComponent],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class ProfileComponent implements OnInit {
  profile: any = null;
  editMode = false;
  loading = false;
  message = '';
  error = '';

  constructor(
    private http: HttpClient, 
    private router: Router,
    public translate: TranslationService
  ) {}

  ngOnInit() {
    this.loadProfile();
    
    window.addEventListener('languageChanged', () => {
      this.profile = { ...this.profile };
    });
  }

  loadProfile() {
    this.loading = true;
    const token = localStorage.getItem('token');
    
    if (!token) {
      this.error = 'Non authentifié';
      this.loading = false;
      this.router.navigate(['/login']);
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    this.http.get(`${environment.apiUrl}/patient/profile`, { headers })
      .subscribe({
        next: (res: any) => {
          console.log('Profile loaded:', res);
          this.profile = res.data;
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading profile:', err);
          this.error = err.error?.message || 'Erreur lors du chargement du profil';
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
    this.message = '';
    this.error = '';
    
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    this.http.put(`${environment.apiUrl}/patient/profile`, this.profile, { headers })
      .subscribe({
        next: (res: any) => {
          console.log('Profile saved:', res);
          this.profile = res.data;
          this.editMode = false;
          this.message = 'Profil mis à jour avec succès';
          this.loading = false;
          
          setTimeout(() => {
            this.message = '';
          }, 3000);
        },
        error: (err) => {
          console.error('Error saving profile:', err);
          this.error = err.error?.message || 'Erreur lors de la mise à jour';
          this.loading = false;
        }
      });
  }

  goBack() {
    this.router.navigate(['/patient/dashboard']);
  }
}
