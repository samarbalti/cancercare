import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DoctorDashboardComponent } from './dashboard/dashboard.component';
import { DoctorProfileComponent } from './profile/profile.component';

const routes: Routes = [
  { path: 'dashboard', component: DoctorDashboardComponent },
  { path: 'profile', component: DoctorProfileComponent },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DoctorRoutingModule { }
