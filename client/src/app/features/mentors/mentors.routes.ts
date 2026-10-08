import { Routes } from '@angular/router';
import { MentorsListComponent } from './mentors-list/mentors-list.component';

export const MENTOR_ROUTES: Routes = [
  { path: '', component: MentorsListComponent, data: { title: 'Find Mentors' } }
];
