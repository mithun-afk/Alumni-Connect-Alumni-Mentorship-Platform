import { Routes } from '@angular/router';
import { StudentsListComponent } from './students-list/students-list.component';

export const STUDENT_ROUTES: Routes = [
  { path: '', component: StudentsListComponent, data: { title: 'Find Students' } }
];
