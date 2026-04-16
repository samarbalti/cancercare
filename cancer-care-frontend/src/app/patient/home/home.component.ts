import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PatientHeaderComponent } from '../shared/header.component';
import { TranslationService } from '../services/translation.service';

@Component({
  selector: 'app-patient-home',
  standalone: true,
  imports: [CommonModule, PatientHeaderComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class PatientHomeComponent implements OnInit {
  user: any = null;

  constructor(
    private router: Router,
    public translate: TranslationService
  ) {}

  ngOnInit() {
    const userData = localStorage.getItem('user');
    if (userData) {
      this.user = JSON.parse(userData);
    }

    window.addEventListener('languageChanged', () => {
      this.user = { ...this.user };
    });
  }

  navigateTo(route: string) {
    this.router.navigate([`/patient/${route}`]);
  }

  navigateToChatbot() {
    this.router.navigate(['/patient/chatbot']);
  }
}
