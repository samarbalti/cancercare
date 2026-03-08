import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./home/home.component').then(m => m.HomeComponent) }, // visitor landing page
  {
    path: 'login',
    loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'register-doctor',
    loadComponent: () => import('./auth/register-doctor/register-doctor.component').then(m => m.RegisterDoctorComponent)
  },
  {
    path: 'patient',
    loadChildren: () => import('./patient/patient.module').then(m => m.PatientModule),
    canActivate: [() => {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/login';
        return false;
      }
      return true;
    }]
  },
  {
    path: 'doctor',
    loadChildren: () => import('./doctor/doctor.module').then(m => m.DoctorModule),
    canActivate: [() => {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/login';
        return false;
      }
      return true;
    }]
  },
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule),
    canActivate: [() => {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/login';
        return false;
      }
      return true;
    }]
  }
];
