
import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { Login } from './features/auth/components/login/login';


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

  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/layout/main-layout.component')
        .then(m => m.MainLayoutComponent),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'main', pathMatch: 'full' },
      { 
        path: 'main', 
        loadComponent: () => import('./features/dashboard/pages/dashboard/dashboard.component').then(m => m.DashboardPageComponent),
        data: { title: 'Dashboard' }
      },
      { 
        path: 'users', 
        loadComponent: () => import('./features/dashboard/pages/users/user-management.component').then(m => m.UserManagementComponent),
        data: { title: 'User Management' }
      },
      { 
        path: 'master', 
        loadComponent: () => import('./features/dashboard/pages/master/master-setup.component').then(m => m.MasterSetupComponent),
        data: { title: 'Master Setup' }
      },
      { 
        path: 'receive', 
        loadComponent: () => import('./features/dashboard/pages/receive/receive-module.component').then(m => m.ReceiveModuleComponent),
        data: { title: 'Receive Module' }
      },
      { 
        path: 'picking', 
        loadComponent: () => import('./features/dashboard/pages/picking/picking-module.component').then(m => m.PickingModuleComponent),
        data: { title: 'Picking Module' }
      },
      { 
        path: 'delivery', 
        loadComponent: () => import('./features/dashboard/pages/delivery/delivery-module.component').then(m => m.DeliveryModuleComponent),
        data: { title: 'Delivery Module' }
      },
      { 
        path: 'report', 
        loadComponent: () => import('./features/dashboard/pages/report/report.component').then(m => m.ReportComponent),
        data: { title: 'Report' }
      },
      { 
        path: 'help', 
        loadComponent: () => import('./features/dashboard/pages/help/help.component').then(m => m.HelpComponent),
        data: { title: 'Help' }
      }
    ]
  },

  {
    path: '**',
    redirectTo: 'login'
  }
];

// export const routes: Routes = [

//   // 🔓 Public route
//   {
//     path: 'login',
//     component: Login
//   },

//   // 🔐 Protected layout wrapper
//   {
//     path: '',
//     loadComponent: () =>
//      import('./features/dashboard/layout/main-layout.component')
//         .then(m => m.MainLayoutComponent),

//     canActivate: [authGuard],

//     children: [
//       {
//         path: '',
//         redirectTo: 'products',
//         pathMatch: 'full'
//       },

//       {
//         path: 'products',
//         loadChildren: () =>
//           import('./features/products/products.routes')
//             .then(m => m.PRODUCTS_ROUTES),
//       }

//       // 👉 add more modules here
//       // dashboard, users, reports etc
//     ]
//   },

//   // ❌ fallback
//   {
//     path: '**',
//     redirectTo: 'login'
//   }
// ];
