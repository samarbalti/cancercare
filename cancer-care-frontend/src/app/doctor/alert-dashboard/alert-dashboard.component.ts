import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatbotService } from '../../services/chatbot.service';
import { SocketService } from '../../services/socket.service';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { Alert, PatientReport } from '../../models/chatbot.model';

@Component({
  selector: 'app-alert-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe, RouterModule],
  templateUrl: './alert-dashboard.component.html',
  styleUrls: ['./alert-dashboard.component.scss']
})
export class AlertDashboardComponent implements OnInit, OnDestroy {
  alerts: Alert[] = [];
  filteredAlerts: Alert[] = [];
  selectedAlert: Alert | null = null;
  patientReport: PatientReport | null = null;

  // Filtres
  filterStatus = 'all';
  filterSeverity = 'all';
  filterType = 'all';
  searchQuery = '';

  // Stats
  stats = {
    total: 0,
    new: 0,
    critical: 0,
    today: 0
  };

  // Loading
  isLoading = false;
  isLoadingReport = false;

  // Socket
  private socketSub: Subscription = new Subscription();

  // Types d'alertes
  alertTypes = [
    { value: 'all', label: 'Toutes', icon: '🔔' },
    { value: 'stress_severe', label: 'Stress sévère', icon: '😰' },
    { value: 'suicide_risk', label: 'Risque suicidaire', icon: '🚨' },
    { value: 'medication_error', label: 'Médicament', icon: '💊' },
    { value: 'scan_anomaly', label: 'Scan anomalie', icon: '🩻' }
  ];

  severities = [
    { value: 'all', label: 'Toutes', color: '#9aa0a6' },
    { value: 'critical', label: '🔴 Critique', color: '#ea4335' },
    { value: 'high', label: '🟠 Haute', color: '#ff6d01' },
    { value: 'medium', label: '🟡 Moyenne', color: '#fbbc04' },
    { value: 'low', label: '🟢 Basse', color: '#34a853' }
  ];

  constructor(
    private chatbotService: ChatbotService,
    private socketService: SocketService
  ) { }

  ngOnInit(): void {
    this.loadAlerts();
    this.setupSocketListeners();
  }

  ngOnDestroy(): void {
    this.socketSub.unsubscribe();
  }

  // ============================================
  // CHARGEMENT DES DONNÉES
  // ============================================

  loadAlerts(): void {
    this.isLoading = true;
    const params: Record<string, string> = {};
    if (this.filterStatus !== 'all') params['status'] = this.filterStatus;
    if (this.filterSeverity !== 'all') params['severity'] = this.filterSeverity;
    this.chatbotService.getAlerts(params).subscribe({
      next: (alerts) => {
        this.alerts = alerts;
        this.applyFilters();
        this.calculateStats();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur chargement alertes:', err);
        this.isLoading = false;
      }
    });
  }

  setupSocketListeners(): void {
    // Connexion socket
    const userId = localStorage.getItem('userId') || '';
    this.socketService.connect(userId);

    // Nouvelle alerte
    this.socketSub.add(
      this.socketService.onNewAlert().subscribe((alert: Alert) => {
        this.alerts.unshift(alert);
        this.applyFilters();
        this.calculateStats();
        this.playNotificationSound();
      })
    );

    // Mise à jour alerte
    this.socketSub.add(
      this.socketService.onAlertUpdate().subscribe((updatedAlert: Alert) => {
        const index = this.alerts.findIndex(a => a._id === updatedAlert._id);
        if (index !== -1) {
          this.alerts[index] = updatedAlert;
          this.applyFilters();
        }
      })
    );
  }

  // ============================================
  // GESTION DES ALERTES
  // ============================================

  selectAlert(alert: Alert): void {
    this.selectedAlert = alert;

    if (alert.status === 'new') {
      this.markAsViewed(alert._id);
    }

    if (alert.patient?._id) {
      this.loadPatientReport(alert.patient._id);
    }
  }

  markAsViewed(alertId: string): void {
    this.chatbotService.markAlertAsViewed(alertId).subscribe({
      next: () => {
        const alert = this.alerts.find(a => a._id === alertId);
        if (alert) {
          alert.status = 'viewed';
          this.calculateStats();
        }
      }
    });
  }

  handleAlert(alertId: string): void {
    this.chatbotService.handleAlert(alertId).subscribe({
      next: () => {
        const alert = this.alerts.find(a => a._id === alertId);
        if (alert) {
          alert.status = 'handled';
          this.applyFilters();
          this.calculateStats();
        }
      }
    });
  }

  resolveAlert(alertId: string): void {
    this.chatbotService.resolveAlert(alertId).subscribe({
      next: () => {
        const alert = this.alerts.find(a => a._id === alertId);
        if (alert) {
          alert.status = 'resolved';
          alert.resolvedAt = new Date();
          this.applyFilters();
          this.calculateStats();
        }
        if (this.selectedAlert?._id === alertId) {
          this.selectedAlert = null;
        }
      }
    });
  }

  loadPatientReport(patientId: string): void {
    this.isLoadingReport = true;
    this.chatbotService.getPatientReport(patientId).subscribe({
      next: (report) => {
        this.patientReport = report;
        this.isLoadingReport = false;
      },
      error: () => {
        this.isLoadingReport = false;
      }
    });
  }

  // ============================================
  // FILTRES ET RECHERCHE
  // ============================================

  applyFilters(): void {
    this.filteredAlerts = this.alerts.filter(alert => {
      const matchStatus = this.filterStatus === 'all' || alert.status === this.filterStatus;
      const matchSeverity = this.filterSeverity === 'all' || alert.severity === this.filterSeverity;
      const matchType = this.filterType === 'all' || alert.type === this.filterType;
      const matchSearch = !this.searchQuery ||
        alert.patient?.firstName?.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        alert.patient?.lastName?.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        alert.description?.toLowerCase().includes(this.searchQuery.toLowerCase());

      return matchStatus && matchSeverity && matchType && matchSearch;
    });
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  calculateStats(): void {
    const today = new Date().toDateString();

    this.stats = {
      total: this.alerts.length,
      new: this.alerts.filter(a => a.status === 'new').length,
      critical: this.alerts.filter(a => a.severity === 'critical' && a.status !== 'resolved').length,
      today: this.alerts.filter(a => new Date(a.createdAt).toDateString() === today).length
    };
  }

  // ============================================
  // UTILITAIRES
  // ============================================

  getSeverityColor(severity: string): string {
    const colors: { [key: string]: string } = {
      critical: '#ea4335',
      high: '#ff6d01',
      medium: '#fbbc04',
      low: '#34a853'
    };
    return colors[severity] || '#9aa0a6';
  }

  getSeverityIcon(severity: string): string {
    const icons: { [key: string]: string } = {
      critical: '🔴',
      high: '🟠',
      medium: '🟡',
      low: '🟢'
    };
    return icons[severity] || '⚪';
  }

  getTypeIcon(type: string): string {
    const icons: { [key: string]: string } = {
      stress_severe: '😰',
      suicide_risk: '🚨',
      medication_error: '💊',
      scan_anomaly: '🩻'
    };
    return icons[type] || '🔔';
  }

  getTypeLabel(type: string): string {
    const typeObj = this.alertTypes.find(t => t.value === type);
    return typeObj ? typeObj.label : type;
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      new: 'Nouveau',
      viewed: 'Vu',
      handled: 'En cours',
      resolved: 'Résolu'
    };
    return labels[status] || status;
  }

  getStatusClass(status: string): string {
    return `status-${status}`;
  }

  formatTimeAgo(date: Date | string): string {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `Il y a ${minutes} min`;
    if (hours < 24) return `Il y a ${hours}h`;
    if (days < 7) return `Il y a ${days} j`;
    return d.toLocaleDateString('fr-FR');
  }

  private playNotificationSound(): void {
    try {
      const audio = new Audio('/assets/sounds/alert.mp3');
      audio.volume = 0.5;
      audio.play().catch(() => { });
    } catch (e) {
      // Ignorer erreurs audio
    }
  }
}
