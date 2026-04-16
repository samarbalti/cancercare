import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Message,
  Alert,
  PatientReport,
  PrescriptionScanResult,
  StressAnalysis
} from '../models/chatbot.model';

@Injectable({ providedIn: 'root' })
export class ChatbotService {

  private api = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  getAlerts(params: Record<string, string>): Observable<Alert[]> {
    let httpParams = new HttpParams();
    Object.keys(params).forEach(key => {
      httpParams = httpParams.set(key, params[key]);
    });
    return this.http.get<Alert[]>(`${this.api}/alerts`, { params: httpParams });
  }

  getPatientReport(id: string): Observable<PatientReport> {
    return this.http.get<PatientReport>(`${this.api}/patients/${id}/report`);
  }

  sendMessage(message: string, sessionId?: string): Observable<Message> {
    return this.http.post<Message>(`${this.api}/chatbot/message`, { message, sessionId });
  }

  scanPrescription(imageBase64: string): Observable<PrescriptionScanResult> {
    return this.http.post<PrescriptionScanResult>(
      `${this.api}/chatbot/scan-prescription`,
      { image: imageBase64 }
    );
  }

  analyzeStress(text: string): Observable<StressAnalysis> {
    return this.http.post<StressAnalysis>(`${this.api}/chatbot/analyze-stress`, { text });
  }

  // FIX TS2339: méthodes renommées correctement
  markAlertAsViewed(alertId: string): Observable<Alert> {
    return this.http.patch<Alert>(`${this.api}/alerts/${alertId}/viewed`, {});
  }

  handleAlert(alertId: string): Observable<Alert> {
    return this.http.patch<Alert>(`${this.api}/alerts/${alertId}/handled`, {});
  }

  resolveAlert(alertId: string): Observable<Alert> {
    return this.http.patch<Alert>(`${this.api}/alerts/${alertId}/resolved`, {});
  }
}
