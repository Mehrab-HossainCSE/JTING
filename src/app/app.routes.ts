
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
        loadChildren: () => import('./features/users/user.routes').then(m => m.USERS_ROUTES),
        data: { title: 'User Management' }
      },
     {
        // ✅ Changed from loadComponent → loadChildren to support child routes
        path: 'master',
        loadChildren: () => import('./features/master/master.routes').then(m => m.MASTER_ROUTES),
      },
      {
        path: 'r-master',
        loadChildren: () => import('./features/r-master/r-master.routes').then(m => m.R_MASTER_ROUTES),
      },
      { 
        path: 'receive', 
        loadChildren: () => import('./features/receive/receive-route').then(m => m.RECEIVE_ROUTES),
        data: { title: 'Receive Module' }
      },
      { 
        path: 'picking', 
        loadChildren: () => import('./features/picking/picking-route').then(m => m.PICKING_ROUTES),
        data: { title: 'Picking Module' }
      },
      { 
        path: 'delivery', 
        loadChildren: () => import('./features/delivery/delivery-route').then(m => m.DELIVERY_ROUTES),
        data: { title: 'Delivery Module' }
      },
      { 
        path: 'report', 
        loadChildren: () => import('./features/report/report-route').then(m => m.REPORT_ROUTES),
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
