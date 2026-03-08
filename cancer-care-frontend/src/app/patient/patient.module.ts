import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { AuthGuard } from '../guards/auth.guard';
import { RoleGuard } from '../guards/role.guard';

// Components
import { DashboardComponent } from './dashboard/dashboard.component';
import { ProfileComponent } from './profile/profile.component';
import { MedicalRecordComponent } from './medical-record/medical-record.component';
import { Appointments } from './appointments/appointments.component';
import { PatientHomeComponent } from './home/home.component';

const routes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['patient'] },
    children: [
      { path: 'home', component: PatientHomeComponent },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'appointments', component: DashboardComponent, data: { section: 'appointments' } },
      { path: 'medical', component: DashboardComponent, data: { section: 'medical' } },
      { path: 'prescriptions', component: DashboardComponent, data: { section: 'prescriptions' } },
      { path: 'messages', component: DashboardComponent, data: { section: 'messages' } },
      { path: 'resources', component: DashboardComponent, data: { section: 'resources' } },
      { path: 'profile', component: ProfileComponent },
      { path: 'medical-records', component: MedicalRecordComponent },
      { path: '', redirectTo: 'home', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes),
    DashboardComponent,
    ProfileComponent,
    MedicalRecordComponent,
    Appointments,
    PatientHomeComponent
  ]
})
export class PatientModule { }
