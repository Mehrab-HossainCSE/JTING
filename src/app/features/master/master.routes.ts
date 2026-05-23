import { Routes } from '@angular/router';

export const MASTER_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./master-setup.component').then(m => m.MasterSetupComponent),
    children: [
      { path: '', redirectTo: 'brand', pathMatch: 'full' },
      
      { path: 'brand', loadComponent: () => import('./tabs/brand-component/brand-component').then(m => m.BrandComponent), data: { title: 'Brand Setup', tabId: 1 } },
      { path: 'sub-brand', loadComponent: () => import('./tabs/sub-brand-component/sub-brand-component').then(m => m.SubBrandComponent), data: { title: 'Sub Brands Setup', tabId: 2 } },
      { path: 'shifts', loadComponent: () => import('./tabs/shift-component/shift-component').then(m => m.ShiftComponent), data: { title: 'Shift Setup', tabId: 3 } },
      {path: 'department', loadComponent: () => import('./tabs/department-component/department-component').then(m => m.DepartmentComponent), data: { title: 'Department Setup', tabId: 4 } },
      {path: 'destinations', loadComponent: () => import('./tabs/destination-component/destination-component').then(m => m.DestinationComponent), data: { title: 'Destination Setup', tabId: 5 } },
      {path: 'sku', loadComponent: () => import('./tabs/sku-component/sku-component').then(m => m.SkuComponent), data: { title: 'SKU Setup', tabId: 10 } },
      {path: 'arch', loadComponent: () => import('./tabs/arch-component/arch-component').then(m => m.ArchComponent), data: { title: 'Arch Setup', tabId: 11 } },
      {path: 'line', loadComponent: () => import('./tabs/line-component/line-component').then(m => m.LineComponent), data: { title: 'Line Setup', tabId: 12 } },
      {path: 'block', loadComponent: () => import('./tabs/block-component/block-component').then(m => m.BlockComponent), data: { title: 'Block Setup', tabId: 13 } },
      
      ]
  }
];