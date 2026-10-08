import { Routes } from '@angular/router';
import { EventsListComponent } from './list/events-list.component';

export const EVENTS_ROUTES: Routes = [
  { path: '', component: EventsListComponent }
];
