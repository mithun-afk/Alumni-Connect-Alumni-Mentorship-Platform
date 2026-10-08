import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  {
    path: '',
    loadComponent: () => import('./layout/layout.component').then(m => m.LayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadChildren: () => import('./features/dashboard/dashboard.routes').then(m => m.DASHBOARD_ROUTES)
      },
      {
        path: 'profile',
        loadChildren: () => import('./features/profile/profile.routes').then(m => m.PROFILE_ROUTES)
      },
      {
        path: 'admin',
        loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES)
      },
      {
        path: 'mentors',
        loadChildren: () => import('./features/mentors/mentors.routes').then(m => m.MENTOR_ROUTES)
      },
      {
        path: 'students',
        loadChildren: () => import('./features/students/students.routes').then(m => m.STUDENT_ROUTES)
      },
      {
        path: 'mentorship',
        loadChildren: () => import('./features/mentorship/mentorship.routes').then(m => m.MENTORSHIP_ROUTES)
      },
      {
        path: 'opportunities',
        loadChildren: () => import('./features/opportunities/opportunities.routes').then(m => m.OPPORTUNITY_ROUTES)
      },
      {
        path: 'events',
        loadChildren: () => import('./features/events/events.routes').then(m => m.EVENT_ROUTES)
      },
      {
        path: 'messages',
        loadChildren: () => import('./features/messages/messages.routes').then(m => m.MESSAGE_ROUTES)
      },
      {
        path: 'referrals',
        loadChildren: () => import('./features/referrals/referrals.routes').then(m => m.REFERRAL_ROUTES)
      },
      {
        path: 'career-path',
        loadComponent: () => import('./features/career-path/career-path.component').then(m => m.CareerPathComponent)
      }
    ]
  },
  { path: '**', redirectTo: '/dashboard' }
];

