import { Routes } from '@angular/router';
export const EVENT_ROUTES: Routes = [{ path: '', loadComponent: () => import('./events-list/events-list.component').then(m => m.EventsListComponent) }];
