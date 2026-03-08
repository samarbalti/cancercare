import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PatientService {
  private apiUrl = `${environment.apiUrl}/patient`;
  private appointmentApiUrl = `${environment.apiUrl}/appointments`;

  constructor(private http: HttpClient) {}

  getProfile() {
    return this.http.get(`${this.apiUrl}/profile`);
  }

  getMedicalRecords() {
    return this.http.get(`${this.apiUrl}/medical-records`);
  }

  getAppointments(status?: string) {
    if (status) {
      return this.http.get(`${this.appointmentApiUrl}?status=${status}`);
    }
    return this.http.get(this.appointmentApiUrl);
  }

  createAppointment(appointmentData: any) {
    return this.http.post(this.appointmentApiUrl, appointmentData);
  }

  cancelAppointment(appointmentId: string, cancellationReason?: string) {
    return this.http.delete(`${this.appointmentApiUrl}/${appointmentId}`, {
      body: { cancellationReason: cancellationReason || '' }
    });
  }

  getAvailableSlots(doctorId: string, date: string) {
    return this.http.get(`${this.appointmentApiUrl}/slots?doctorId=${doctorId}&date=${date}`);
  }

  getPrescriptions() {
    return this.http.get(`${this.apiUrl}/prescriptions`);
  }

  getMedicalRecord(id: string) {
    return this.http.get(`${this.apiUrl}/medical-records/${id}`);
  }

  downloadMedicalRecord(id: string) {
    return this.http.get(`${this.apiUrl}/medical-records/${id}/download`, {
      responseType: 'blob'
    });
  }

  getPrescription(id: string) {
    return this.http.get(`${this.apiUrl}/prescriptions/${id}`);
  }

  downloadPrescription(id: string) {
    return this.http.get(`${this.apiUrl}/prescriptions/${id}/download`, {
      responseType: 'blob'
    });
  }

  getMessages() {
    return this.http.get(`${this.apiUrl}/messages`);
  }

  sendMessage(content: string, doctorEmail: string) {
    return this.http.post(`${this.apiUrl}/messages`, {
      content: content.trim(),
      doctorEmail: doctorEmail.trim()
    });
  }

  markMessageAsRead(messageId: string) {
    return this.http.put(`${this.apiUrl}/messages/${messageId}/read`, {});
  }
}
