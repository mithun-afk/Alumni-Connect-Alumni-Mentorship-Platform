import { Routes } from '@angular/router';
import { RequestsComponent } from './requests/requests.component';
import { MentorshipListComponent } from './list/mentorship-list.component';
import { JourneyComponent } from './journey/journey.component';
import { OfficeHoursComponent } from './office-hours/office-hours.component';

export const MENTORSHIP_ROUTES: Routes = [
  { path: '', component: MentorshipListComponent, data: { title: 'Mentorships' } },
  { path: 'requests', component: RequestsComponent, data: { title: 'Mentorship Requests' } },
  { path: 'my-mentorships', component: MentorshipListComponent, data: { title: 'My Mentorships' } },
  { path: 'journey/:id', component: JourneyComponent, data: { title: 'Mentorship Journey' } },
  { path: 'office-hours', component: OfficeHoursComponent, data: { title: 'Office Hours' } },
  { path: 'mentees', component: MentorshipListComponent, data: { title: 'My Mentees' } }
];

