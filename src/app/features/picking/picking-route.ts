import { Routes } from '@angular/router';

export const PICKING_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./picking-module.component').then(m => m.PickingModuleComponent),
    children: [
      { path: '', redirectTo: 'picking', pathMatch: 'full' },
      { 
        path: 'picking', 
        loadComponent: () => import('./tabs/picking/picking').then(m => m.Picking), 
        data: { title: 'Picking' } 
      },
      { 
        path: 'transfer-restore', 
        loadComponent: () => import('./tabs/transfer-restore/transfer-restore').then(m => m.TransferRestore), 
        data: { title: 'Transfer/Restore' } 
      }
    ]
  }
];
