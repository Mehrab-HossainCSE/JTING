import { Routes } from '@angular/router';

export const R_MASTER_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./r-master-setup.component').then(m => m.RMasterSetupComponent),
    children: [
      { path: '', redirectTo: 'r-block-setup', pathMatch: 'full' },
      {
        path: 'r-block-setup',
        loadComponent: () =>
          import('./tabs/r-block-component/r-block-component').then(m => m.RBlockComponent),
        data: { title: 'Regional Block Setup', tabId: 70 }
      }
    ]
  }
];
