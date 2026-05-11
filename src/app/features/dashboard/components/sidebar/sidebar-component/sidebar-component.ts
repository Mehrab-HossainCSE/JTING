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

  expandedMenus = signal<Set<number>>(new Set());

  constructor() {
    // Load menus when component initializes
   // this.menuService.loadMenus().subscribe();
  }

  toggleExpand(menuId: number) {
    this.expandedMenus.update(set => {
      const next = new Set(set);
      next.has(menuId) ? next.delete(menuId) : next.add(menuId);
      return next;
    });
  }

  isExpanded(menuId: number): boolean {
    return this.expandedMenus().has(menuId);
  }

  logout() {
    this.authService.logout();
  }
}