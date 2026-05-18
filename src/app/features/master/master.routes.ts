import { Routes } from '@angular/router';

export const MASTER_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./master-setup.component').then(m => m.MasterSetupComponent),
    children: [
      { path: '', redirectTo: 'brand', pathMatch: 'full' },
      
      { path: 'brand', loadComponent: () => import('./tabs/brand-component/brand-component').then(m => m.BrandComponent), data: { title: 'Brand Setup', tabId: 1 } },
      { path: 'sub-brand', loadComponent: () => import('./tabs/sub-brand-component/sub-brand-component').then(m => m.SubBrandComponent), data: { title: 'Sub Brands Setup', tabId: 2 } },
      
      ]
  }
];