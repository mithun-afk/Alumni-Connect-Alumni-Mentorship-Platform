import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role.guard';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    data: { roles: ['admin'] },
    canActivate: [roleGuard],
    children: [
      {
        path: 'alumni-verification',
        loadComponent: () => import('./alumni-verification/alumni-verification.component').then(m => m.AlumniVerificationComponent)
      },
      {
        path: 'users',
        loadComponent: () => import('./user-management/user-management.component').then(m => m.UserManagementComponent)
      },
      {
        path: 'audit-logs',
        loadComponent: () => import('./audit-log/audit-log.component').then(m => m.AuditLogComponent)
      },
      {
        path: 'moderation',
        loadComponent: () => import('./moderation/admin.component').then(m => m.ModerationComponent)
      },
      {
        path: '',
        redirectTo: 'users',
        pathMatch: 'full'
      }
    ]
  }
];
