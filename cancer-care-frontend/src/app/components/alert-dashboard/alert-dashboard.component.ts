import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ChatbotService } from '../../services/chatbot.service';
import { Alert, PatientReport } from '../../models/chatbot.model';

@Component({
  selector: 'app-alert-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './alert-dashboard.component.html',
  styleUrls: ['./alert-dashboard.component.scss']
})
export class AlertDashboardComponent implements OnInit {

  alerts: Alert[] = [];
  filteredAlerts: Alert[] = [];

  loading = false;

  selectedSeverity = 'all';
  filterStatus = 'all';
  showViewed = false;
  searchQuery = '';

  patientReport: PatientReport | null = null;
  showReportModal = false;

  stats = {
    total: 0,
    new: 0,
    high: 0,
    medium: 0,
    low: 0
  };

  constructor(private chatbotService: ChatbotService) {}

  ngOnInit(): void {
    this.loadAlerts();
  }

  loadAlerts(): void {
    this.loading = true;
    this.chatbotService.getAlerts({}).subscribe({
      next: (alerts: Alert[]) => {
        this.alerts = alerts;
        this.applyFilters();
        this.updateStats();
        this.loading = false;
      },
      error: (err: unknown) => {
        console.error('Erreur lors du chargement des alertes:', err);
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    const q = this.searchQuery.toLowerCase();

    this.filteredAlerts = this.alerts.filter(a =>
      !q ||
      a.patientName?.toLowerCase().includes(q) ||
      a.message?.toLowerCase().includes(q)
    );
  }

  updateStats(): void {
    this.stats = {
      total: this.alerts.length,
      new: this.alerts.filter(a => a.status === 'new').length,
      high: this.alerts.filter(a => a.severity === 'high').length,
      medium: this.alerts.filter(a => a.severity === 'medium').length,
      low: this.alerts.filter(a => a.severity === 'low').length
    };
  }

  viewPatientReport(id: string): void {
    this.chatbotService.getPatientReport(id).subscribe({
      next: (report: PatientReport) => {
        this.patientReport = report;
        this.showReportModal = true;
      },
      error: (err: unknown) => {
        console.error('Erreur lors du chargement du rapport:', err);
      }
    });
  }

  closeReportModal(): void {
    this.patientReport = null;
    this.showReportModal = false;
  }

  getSeverityColor(s: string): string {
    return s === 'high'
      ? '#e53935'
      : s === 'medium'
        ? '#fb8c00'
        : '#43a047';
  }
}
