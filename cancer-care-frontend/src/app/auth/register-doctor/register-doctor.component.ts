import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register-doctor',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register-doctor.component.html',
  styleUrls: ['./register-doctor.component.css']
})
export class RegisterDoctorComponent {
  doctor = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    specialization: '',
    licenseNumber: '',
    hospital: '',
    department: '',
    bio: '',
    experience: 0
  };

  error = '';
  success = '';
  loading = false;

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    this.loading = true;
    this.error = '';
    this.success = '';

    console.log('Données envoyées:', this.doctor);

    this.authService.registerDoctor(this.doctor).subscribe({
      next: (response) => {
        console.log('Réponse:', response);
        this.success = 'Inscription réussie ! Votre compte est en attente de validation par un administrateur.';
        this.loading = false;
        setTimeout(() => this.router.navigate(['/login']), 3000);
      },
      error: (err) => {
        console.error('Erreur complète:', err);
        console.error('Détails erreur:', err.error);
        let errorMsg = 'Erreur lors de l\'inscription';
        if (err.error?.errors && err.error.errors.length > 0) {
          errorMsg = err.error.errors.map((e: any) => `${e.path}: ${e.msg}`).join(', ');
        } else if (err.error?.message) {
          errorMsg = err.error.message;
        }
        this.error = errorMsg;
        this.loading = false;
      }
    });
  }
}
