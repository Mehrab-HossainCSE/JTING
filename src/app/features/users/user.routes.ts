import { Routes } from '@angular/router';

export const USERS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./user-management.component').then(m => m.UserManagementComponent),
    children: [
      {
        path: 'create-user',
        loadComponent: () => import('./tabs/create-user-component').then(m => m.CreateUserComponent),
        data: { title: 'Create User' }
      },
      {
        path: 'create-role',
        loadComponent: () => import('./tabs/create-role-component').then(m => m.CreateRoleComponent),
        data: { title: 'Create Role' }
      },
      {
        path: 'assign-role',
        loadComponent: () => import('./tabs/assign-role-component').then(m => m.AssignRoleComponent),
        data: { title: 'Assign Module With Role' }
      }
    ]
  }
];
