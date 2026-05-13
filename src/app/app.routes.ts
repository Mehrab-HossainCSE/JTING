
import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },

  // 🔓 Public routes (no layout)
  {
    path: '',
    loadChildren: () =>
      import('./features/auth/auth.routes')
        .then(m => m.AUTH_ROUTES)
  },

  // 🔐 Protected routes (with sidebar/header)
  {
    path: '',
    loadComponent: () =>
      import('./layout/main-layout/main-layout.component')
        .then(m => m.MainLayoutComponent),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { 
        path: 'dashboard', 
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardPageComponent),
        data: { title: 'Dashboard' }
      },
      { 
        path: 'users', 
        loadComponent: () => import('./features/users/user-management.component').then(m => m.UserManagementComponent),
        data: { title: 'User Management' }
      },
      { 
        path: 'master', 
        loadComponent: () => import('./features/master/master-setup.component').then(m => m.MasterSetupComponent),
        data: { title: 'Master Setup' }
      },
      { 
        path: 'receive', 
        loadComponent: () => import('./features/receive/receive-module.component').then(m => m.ReceiveModuleComponent),
        data: { title: 'Receive Module' }
      },
      { 
        path: 'picking', 
        loadComponent: () => import('./features/picking/picking-module.component').then(m => m.PickingModuleComponent),
        data: { title: 'Picking Module' }
      },
      { 
        path: 'delivery', 
        loadComponent: () => import('./features/delivery/delivery-module.component').then(m => m.DeliveryModuleComponent),
        data: { title: 'Delivery Module' }
      },
      { 
        path: 'report', 
        loadComponent: () => import('./features/report/report.component').then(m => m.ReportComponent),
        data: { title: 'Report' }
      },
      { 
        path: 'help', 
        loadComponent: () => import('./features/help/help.component').then(m => m.HelpComponent),
        data: { title: 'Help' }
      },
      {
        path: 'products',
        loadChildren: () => import('./features/products/products.routes').then(m => m.PRODUCTS_ROUTES),
      },
      {
        path: 'employee',
        loadChildren: () => import('./features/Employee/employee.routes').then(m => m.EMPLOYEE_ROUTES),
      }
    ]
  },

  {
    path: '**',
    redirectTo: 'login'
  }
];
