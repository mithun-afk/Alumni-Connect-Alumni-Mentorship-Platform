import { Routes } from '@angular/router';
export const OPPORTUNITY_ROUTES: Routes = [{ path: '', loadComponent: () => import('./opportunities-list/opportunities-list.component').then(m => m.OpportunitiesListComponent) }];
