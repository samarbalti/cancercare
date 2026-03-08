import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  user = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    emergencyContact: {
      name: '',
      phone: '',
      relation: ''
    }
  };

  error = '';
  success = '';
  loading = false;

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    this.loading = true;
    this.error = '';
    this.success = '';

    // Préparer les données - ne pas envoyer emergencyContact si vide
    const dataToSend: any = {
      firstName: this.user.firstName,
      lastName: this.user.lastName,
      email: this.user.email,
      password: this.user.password
    };

    if (this.user.phone) dataToSend.phone = this.user.phone;
    if (this.user.dateOfBirth) dataToSend.dateOfBirth = this.user.dateOfBirth;
    if (this.user.gender) dataToSend.gender = this.user.gender;

    // Ajouter emergencyContact seulement si au moins un champ est rempli
    if (this.user.emergencyContact.name || this.user.emergencyContact.phone) {
      dataToSend.emergencyContact = {
        name: this.user.emergencyContact.name || '',
        phone: this.user.emergencyContact.phone || '',
        relation: this.user.emergencyContact.relation || ''
      };
    }

    this.authService.registerPatient(dataToSend).subscribe({
      next: () => {
        this.success = 'Inscription réussie ! Redirection...';
        this.loading = false;
        setTimeout(() => this.router.navigate(['/login']), 1500);
      },
      error: (err) => {
        console.error('Erreur inscription:', err);
        console.error('Message d\'erreur:', err.error);
        
        let errorMsg = 'Erreur lors de l\'inscription';
        if (err.error?.errors && err.error.errors.length > 0) {
          errorMsg = err.error.errors.map((e: any) => e.msg).join(', ');
        } else if (err.error?.message) {
          errorMsg = err.error.message;
        }
        
        this.error = errorMsg;
        this.loading = false;
      }
    });
  }
}
