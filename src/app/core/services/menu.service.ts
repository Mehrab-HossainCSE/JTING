import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, of, tap } from 'rxjs';
import { MenuItem } from '../models/menu.model';
import { environment } from '../../../environments/environment.development';


@Injectable({ providedIn: 'root' })
export class MenuService {
  private http = inject(HttpClient);
  private readonly API_URL = environment.apiUrl;

  // signals — auto UI update, no zone needed
  private _menus = signal<MenuItem[]>([]);
  
  private _loading = signal(false);

  readonly menus = this._menus.asReadonly();
  readonly loading = this._loading.asReadonly();

loadMenus() {
  this._loading.set(true);

  return this.http.get<MenuItem[]>(`${this.API_URL}/NavMenus`).pipe(
    tap({
      next: (res) => {
        this._menus.set(this.buildTree(res));
        this._loading.set(false);
      },
      error: () => this._loading.set(false)
    })
  );
}
 
  // loadMenus(): Observable<MenuItem[]> {
  //   const menus = this.buildTree(this.DEFAULT_MENUS);
  //   this._menus.set(menus);

  //   return of(menus); // ✅ IMPORTANT: return observable
  // }
  

  clearMenus() {
    this._menus.set([]);
  }

  // Transform backend response and build parent → children tree
 private buildTree(menus: MenuItem[]): MenuItem[] {
  if (!menus || menus.length === 0) return [];

  // Map backend properties to template properties
  menus.forEach(menu => {
    // Ensure all required properties are assigned
    menu.menuId = menu.id;
    menu.menuName = menu.name || '';
    menu.icon = menu.navIcon || '';

    // Generate URL based on menu name if not provided
    if (!menu.url || menu.url === '') {
      const baseUrl = menu.name?.toLowerCase() || '';
      menu.menuUrl = baseUrl ? `/dashboard/${baseUrl}` : '';
    } else {
      menu.menuUrl = `/dashboard${menu.url.startsWith('/') ? '' : '/'}${menu.url}`;
    }

    menu.children = [];
  });

  const map = new Map<number, MenuItem>();
  const roots: MenuItem[] = [];

  menus.forEach(menu => {
    map.set(menu.id, menu);
  });

  menus.forEach(menu => {
    if (menu.parentMenuId) {
      const parent = map.get(menu.parentMenuId);
      parent?.children?.push(menu);
    } else {
      roots.push(menu);
    }
  });

  return roots;
}

}