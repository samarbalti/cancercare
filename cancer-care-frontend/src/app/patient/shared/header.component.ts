import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TranslationService } from '../services/translation.service';

@Component({
  selector: 'app-patient-header',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class PatientHeaderComponent implements OnInit {
  currentLang: string = 'fr';

  constructor(
    private router: Router,
    public translate: TranslationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.currentLang = this.translate.getLanguage();
  }

  t(key: string): string {
    return this.translate.translate(key);
  }

  changeLanguage() {
    this.translate.setLanguage(this.currentLang);
    this.cdr.detectChanges();
    window.dispatchEvent(new Event('languageChanged'));
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}
