import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DoctorService {
  private apiUrl = `${environment.apiUrl}/doctors`;
  private appointmentApiUrl = `${environment.apiUrl}/appointments`;

  constructor(private http: HttpClient) {}

  getDoctors() {
    return this.http.get(`${this.apiUrl}`);
  }

  getDoctorById(id: string) {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  getAppointments() {
    return this.http.get(`${this.apiUrl}/appointments`);
  }

  confirmAppointment(appointmentId: string) {
    return this.http.put(`${this.appointmentApiUrl}/${appointmentId}/confirm`, {});
  }

  getMessages() {
    return this.http.get(`${this.apiUrl}/messages`);
  }

  sendMessage(content: string, patientEmail: string) {
    return this.http.post(`${this.apiUrl}/messages`, {
      content: content.trim(),
      patientEmail: patientEmail.trim()
    });
  }

  updateProfile(profileData: any) {
    return this.http.put(`${this.apiUrl}/profile`, profileData);
  }

  getAvailability() {
    return this.http.get(`${this.apiUrl}/availability`);
  }

  setAvailability(availability: any) {
    return this.http.post(`${this.apiUrl}/availability`, availability);
  }
}

