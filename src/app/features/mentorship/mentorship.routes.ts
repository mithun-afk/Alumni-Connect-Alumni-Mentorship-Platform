import { Routes } from '@angular/router';
import { MentorshipListComponent } from './list/list.component';
import { RequestsComponent } from './requests/requests.component';
import { JourneyComponent } from './journey/journey.component';
import { OfficeHoursComponent } from './office-hours/office-hours.component';

export const MENTORSHIP_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full'
  },
  {
    path: 'list',
    component: MentorshipListComponent
  },
  {
    path: 'requests',
    component: RequestsComponent
  },
  {
    path: 'journey/:id',
    component: JourneyComponent
  },
  {
    path: 'office-hours',
    component: OfficeHoursComponent
  }
];
