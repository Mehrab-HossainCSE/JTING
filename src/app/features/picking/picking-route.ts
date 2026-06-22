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
        data: { title: 'Picking' },
        children: [
          { path: '', redirectTo: 'start-picking', pathMatch: 'full' },
          { path: 'start-picking', loadComponent: () => import('./tabs/picking/pages/start-picking/start-picking').then(m => m.StartPicking) },
          { path: 'inprogress',    loadComponent: () => import('./tabs/picking/pages/inprogress/inprogress').then(m => m.Inprogress) },
          { path: 'complete',      loadComponent: () => import('./tabs/picking/pages/complete/complete').then(m => m.Complete) },
        ]
      },
      {
        path: 'transfer-restore',
        loadComponent: () => import('./tabs/transfer-restore/transfer-restore').then(m => m.TransferRestore),
        data: { title: 'Transfer/Restore' },
        children: [
          { path: '', redirectTo: 'transfer', pathMatch: 'full' },
          { path: 'transfer', loadComponent: () => import('./tabs/transfer-restore/pages/transfer/transfer').then(m => m.Transfer) },
          { path: 'restore-from-TA', loadComponent: () => import('./tabs/transfer-restore/pages/restore-from-ta/restore-from-ta').then(m => m.RestoreFromTa) },
          { path: 'list-of-transfer', loadComponent: () => import('./tabs/transfer-restore/pages/list-of-transfer/list-of-transfer').then(m => m.ListOfTransfer) }
        ]
      }
    ]
  }
];
