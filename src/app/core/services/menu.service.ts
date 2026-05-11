import { Injectable, signal } from '@angular/core';
import { MenuItem } from '../models/menu.model';

@Injectable({ providedIn: 'root' })
export class MenuService {
  private _menus = signal<MenuItem[]>([
    {
      id: 1,
      menuId: 1,
      menuName: 'Dashboard',
      menuUrl: '/dashboard/main',
      icon: '<i class="bi bi-grid-fill"></i>',
      children: []
    },
    {
      id: 2,
      menuId: 2,
      menuName: 'User Management',
      menuUrl: '/dashboard/users',
      icon: '<i class="bi bi-person-fill"></i>',
      children: []
    },
    {
      id: 3,
      menuId: 3,
      menuName: 'Master Setup',
      menuUrl: '/dashboard/master',
      icon: '<i class="bi bi-gear-fill"></i>',
      children: []
    },
    {
      id: 4,
      menuId: 4,
      menuName: 'Receive Module',
      menuUrl: '/dashboard/receive',
      icon: '<i class="bi bi-box-arrow-in-down"></i>',
      children: []
    },
    {
      id: 5,
      menuId: 5,
      menuName: 'Picking Module',
      menuUrl: '/dashboard/picking',
      icon: '<i class="bi bi-box-seam"></i>',
      children: []
    },
    {
      id: 6,
      menuId: 6,
      menuName: 'Delivery Module',
      menuUrl: '/dashboard/delivery',
      icon: '<i class="bi bi-truck"></i>',
      children: []
    },
    {
      id: 7,
      menuId: 7,
      menuName: 'Report',
      menuUrl: '/dashboard/report',
      icon: '<i class="bi bi-bar-chart-line-fill"></i>',
      children: []
    },
    {
      id: 8,
      menuId: 8,
      menuName: 'Help',
      menuUrl: '/dashboard/help',
      icon: '<i class="bi bi-question-circle-fill"></i>',
      children: []
    }
  ]);
  
  private _loading = signal(false);

  readonly menus = this._menus.asReadonly();
  readonly loading = this._loading.asReadonly();

  loadMenus() {
    // Static data already set
    this._loading.set(false);
  }

  clearMenus() {
    this._menus.set([]);
  }
}