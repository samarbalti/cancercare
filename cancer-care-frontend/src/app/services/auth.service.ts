import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'patient' | 'doctor' | 'admin';
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (user && token) {
      this.currentUserSubject.next(JSON.parse(user));
    }
  }

  login(email: string, password: string): Observable<any> {
    console.log('Tentative de connexion...', { email }); // DEBUG

    return this.http.post(`${this.apiUrl}/login`, { email, password }).pipe(
      tap({
        next: (response: any) => {
          console.log('Connexion réussie!', response); // DEBUG
          localStorage.setItem('token', response.token);
          localStorage.setItem('user', JSON.stringify(response.user));
          this.currentUserSubject.next(response.user);
        },
        error: (error) => {
          console.error('Erreur connexion:', error); // DEBUG
        }
      })
    );
  }

  registerPatient(data: any): Observable<any> {
    console.log('Tentative inscription...', data);
    return this.http.post(`${this.apiUrl}/register-patient`, data).pipe(
      tap({
        next: (response) => console.log('Inscription réussie!', response),
        error: (error) => console.error('Erreur inscription:', error)
      })
    );
  }

  registerDoctor(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register-doctor`, data);
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getRole(): string | null {
    return this.currentUserSubject.value?.role || null;
  }
}
