import { Routes } from '@angular/router';
export const MESSAGE_ROUTES: Routes = [{ path: '', loadComponent: () => import('./messages-view/messages-view.component').then(m => m.MessagesViewComponent) }];
