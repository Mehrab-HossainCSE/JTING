
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

  // 🔐 Protected layout wrapper
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/layout/main-layout.component')
        .then(m => m.MainLayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'products',
        pathMatch: 'full'
      },
      {
        path: 'products',
        loadChildren: () =>
          import('./features/products/products.routes')
            .then(m => m.PRODUCTS_ROUTES)
      },
      {
        path: 'employees',
        loadChildren: () =>
          import('./features/Employee/employee.routes')
            .then(m => m.EMPLOYEE_ROUTES)
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
