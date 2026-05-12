import { ChangeDetectionStrategy, Component, inject, signal, effect } from '@angular/core';
import { AuthService } from '../../../../../core/services/auth.service';
import { MenuService } from '../../../../../core/services/menu.service';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar-component',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule,RouterLink, RouterLinkActive],
  templateUrl: './sidebar-component.html',
  styleUrl: './sidebar-component.scss',
})
export class SidebarComponent {
  menuService = inject(MenuService);
  authService = inject(AuthService);
  menus = this.menuService.menus;

  // ✅ Track expanded parent menus
  expandedMenus = signal<Set<number>>(new Set());

  // constructor(
  //   private menuService: MenuService,
  //   private authService: AuthService
  // ) {}

  ngOnInit(): void {
    const userName = this.authService.getLocalStorageUserName();

    if (userName) {
      this.menuService.loadMenus(userName);
    }
  }

  toggleMenu(menuId: number): void {
    const current = new Set(this.expandedMenus());

    if (current.has(menuId)) {
      current.delete(menuId);
    } else {
      current.add(menuId);
    }

    this.expandedMenus.set(current);
  }

  isExpanded(menuId: number): boolean {
    return this.expandedMenus().has(menuId);
  }
  toggleExpand(menuId: number) {
    this.expandedMenus.update(set => {
      const next = new Set(set);
      next.has(menuId) ? next.delete(menuId) : next.add(menuId);
      return next;
    });
  }

  

  logout() {
    this.authService.logout();
  }
}