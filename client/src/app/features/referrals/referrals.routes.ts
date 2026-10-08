import { Routes } from '@angular/router';
export const REFERRAL_ROUTES: Routes = [{ path: '', loadComponent: () => import('./referrals-list/referrals-list.component').then(m => m.ReferralsListComponent) }];
