import { Injectable, signal, computed } from '@angular/core';
import { MenuResponse, ApiMenuResponse, SubMenu } from '../models/MenuResponse';
import { NavMenuService } from './navMenusServices/nav-menu-service';
import { StorageService } from './storage.service';
import { finalize } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MenuService {
  
  private _menus = signal<MenuResponse[]>([]);
  private _loading = signal(false);

  readonly menus = this._menus.asReadonly();
  readonly loading = this._loading.asReadonly();

  readonly hasDashboardPermission = computed(() => {
    const checkRecursive = (items: MenuResponse[]): boolean => {
      for (const item of items) {
        if (
          item.name.toUpperCase() === 'DASHBOARD' ||
          item.displayName.toUpperCase() === 'DASHBOARD' ||
          item.url === '/dashboard'
        ) {
          return true;
        }
        if (item.children?.length && checkRecursive(item.children)) {
          return true;
        }
      }
      return false;
    };
    return checkRecursive(this.menus());
  });

  constructor(
    private navMenuService: NavMenuService,
    private storageService: StorageService,
  ) {
    const storedMenus = this.storageService.getAngularItem<MenuResponse[]>('menus');
    if (storedMenus?.length) {
      this._menus.set(storedMenus);
    }
  }

  loadMenus(userName: string) {
  this._loading.set(true);

  this.navMenuService.getNavMenusByUserName(userName)
    .pipe(
      finalize(() => this._loading.set(false))
    )
    .subscribe({
      next: (res) => {
        if (res.success && res.data) {
          const sortedMenus = (res.data as any[]).sort((a, b) => a.displayOrder - b.displayOrder);

          sortedMenus.forEach((menu: any) => {
            if (menu.subMenus && menu.subMenus.length > 0) {
              const flattened: any[] = [];
              menu.subMenus.forEach((sub: any) => {
                if (sub.children && sub.children.length > 0) {
                  const sortedSubChildren = [...sub.children].sort((a, b) => a.displayOrder - b.displayOrder);
                  sub.children = sortedSubChildren;
                  flattened.push(...sortedSubChildren);
                }
              });
              flattened.sort((a, b) => a.displayOrder - b.displayOrder);
              menu.children = flattened;
            } else if (menu.children?.length) {
              menu.children = [...menu.children].sort((a, b) => a.displayOrder - b.displayOrder);
            }
          });

          this._menus.set(sortedMenus as MenuResponse[]);
          this.storageService.setAngularItem('menus', sortedMenus);
        } else {
          console.warn('Menu API returned unsuccessful response', res.message);
          this._menus.set([]);
          this.storageService.removeItem('menus');
        }
      },
      error: (err) => {
        console.error('Menu load failed', err);
        this._menus.set([]);
        this.storageService.removeItem('menus');
      }
    });
}

  clearMenus() {
    this._menus.set([]);
  }
}