import { Routes } from '@angular/router';

import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ListObservationsComponent } from './components/list-observations/list-observations.component';

export const routes: Routes = [
  { path: 'dashboard', component: DashboardComponent },
  { path: 'list-observations', component: ListObservationsComponent},
  { path: '**', redirectTo: 'dashboard'},
];
