import { Routes } from '@angular/router';

export const RECEIVE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./receive-module.component').then(m => m.ReceiveModuleComponent),
    children: [
      { path: '', redirectTo: 'auto-receive', pathMatch: 'full' },

      ]
  }
];