import { Routes } from '@angular/router';

import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ListObservationsComponent } from './components/list-observations/list-observations.component';
import { ErrorComponent } from './components/error/error.component';

export const routes: Routes = [
  { path: 'dashboard', component: DashboardComponent },
  { path: 'list-observations', component: ListObservationsComponent },
  { path: 'error', component: ErrorComponent },
  { path: '**', redirectTo: 'dashboard' },
];
