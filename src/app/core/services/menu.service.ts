import { Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { MenuResponse, ApiMenuResponse } from '../models/MenuResponse';
import { HttpClient } from '@angular/common/http';
import { finalize } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MenuService {
  
  private _menus = signal<MenuResponse[]>([]);
  private _loading = signal(false);

  readonly menus = this._menus.asReadonly();
  readonly loading = this._loading.asReadonly();
  private readonly API_URL = environment.apiUrl; 
  constructor(private http: HttpClient) {}

loadMenus(userName: string) {
  this._loading.set(true);

  const url = `${this.API_URL}/NavMenus/children/username/${userName}`;

  this.http.get<ApiMenuResponse>(url)
    .pipe(
      finalize(() => this._loading.set(false))
    )
    .subscribe({
      next: (res) => {

        if (res.success && res.data) {

          // ✅ Sort parent menus
          const sortedMenus = [...res.data].sort(
            (a, b) => a.displayOrder - b.displayOrder
          );

          // ✅ Sort child menus
          sortedMenus.forEach(menu => {

            if (menu.children?.length) {

              menu.children = [...menu.children].sort(
                (a, b) => a.displayOrder - b.displayOrder
              );

            }

          });

            this._menus.set(sortedMenus);
            localStorage.setItem('menus', JSON.stringify(sortedMenus));
        } else {

          console.warn(
            'Menu API returned unsuccessful response',
            res.message
          );

          this._menus.set([]);
        }

      },

      error: (err) => {

        console.error('Menu load failed', err);

        this._menus.set([]);

      }
    });
}

  clearMenus() {
    this._menus.set([]);
  }
}