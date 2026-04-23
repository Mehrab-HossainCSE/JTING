import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, of, tap } from 'rxjs';
import { MenuItem, MenuResponse } from '../models/menu.model';


@Injectable({ providedIn: 'root' })
export class MenuService {
  private http = inject(HttpClient);
  private readonly API_URL = 'https://your-api.com/api';
private readonly DEFAULT_MENUS: MenuItem[] = [
    {
      menuId: 1,
      menuName: 'Dashboard',
      menuUrl: '/dashboard',
      icon: '📊',
      parentId: null
    },
    {
      menuId: 2,
      menuName: 'Products',
      menuUrl: '/products',
      icon: '📦',
      parentId: null,
      children: [
        {
          menuId: 21,
          menuName: 'Product List',
          menuUrl: '/products',
          icon: '📋',
          parentId: 2
        }
      ]
    }
  ];
  // signals — auto UI update, no zone needed
  private _menus = signal<MenuItem[]>([]);
  
  private _loading = signal(false);

  readonly menus = this._menus.asReadonly();
  readonly loading = this._loading.asReadonly();

  // loadMenus() {
  //   this._loading.set(true);
  //   return this.http.get<MenuResponse>(`${this.API_URL}/menu/user-menus`).pipe(
  //     tap({
  //       next: (res) => {
  //         this._menus.set(this.buildTree(res.menus));
  //         this._loading.set(false);
  //       },
  //       error: () => this._loading.set(false)
  //     })
  //   );
  // }
 
  loadMenus(): Observable<MenuItem[]> {
    const menus = this.buildTree(this.DEFAULT_MENUS);
    this._menus.set(menus);

    return of(menus); // ✅ IMPORTANT: return observable
  }
  

  clearMenus() {
    this._menus.set([]);
  }

  // Build parent → children tree
  private buildTree(menus: MenuItem[]): MenuItem[] {
    const map = new Map<number, MenuItem>();
    const roots: MenuItem[] = [];

    menus.forEach(m => map.set(m.menuId, { ...m, children: [] }));

    map.forEach(m => {
      if (m.parentId && map.has(m.parentId)) {
        map.get(m.parentId)!.children!.push(m);
      } else {
        roots.push(m);
      }
    });

    return roots;
  }
}