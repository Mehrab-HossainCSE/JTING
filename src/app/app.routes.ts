
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
        loadComponent: () => import('./shared/components/tab-placeholder/tab-placeholder.component').then(m => m.TabPlaceholderComponent),
        data: { title: 'Dashboard' }
      },
      { 
        path: 'users', 
        loadComponent: () => import('./shared/components/tab-placeholder/tab-placeholder.component').then(m => m.TabPlaceholderComponent),
        data: { title: 'User Management' }
      },
      { 
        path: 'master', 
        loadComponent: () => import('./shared/components/tab-placeholder/tab-placeholder.component').then(m => m.TabPlaceholderComponent),
        data: { title: 'Master Setup' }
      },
      { 
        path: 'receive', 
        loadComponent: () => import('./shared/components/tab-placeholder/tab-placeholder.component').then(m => m.TabPlaceholderComponent),
        data: { title: 'Receive Module' }
      },
      { 
        path: 'picking', 
        loadComponent: () => import('./shared/components/tab-placeholder/tab-placeholder.component').then(m => m.TabPlaceholderComponent),
        data: { title: 'Picking Module' }
      },
      { 
        path: 'delivery', 
        loadComponent: () => import('./shared/components/tab-placeholder/tab-placeholder.component').then(m => m.TabPlaceholderComponent),
        data: { title: 'Delivery Module' }
      },
      { 
        path: 'report', 
        loadComponent: () => import('./shared/components/tab-placeholder/tab-placeholder.component').then(m => m.TabPlaceholderComponent),
        data: { title: 'Report' }
      },
      { 
        path: 'help', 
        loadComponent: () => import('./shared/components/tab-placeholder/tab-placeholder.component').then(m => m.TabPlaceholderComponent),
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
