import { ChangeDetectionStrategy, Component, inject, signal, effect, computed } from '@angular/core';
import { AuthService } from '../../../../../core/services/auth.service';
import { MenuService } from '../../../../../core/services/menu.service';
import { UIStateService } from '../../../../../core/services/ui-state.service';
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
  uiService = inject(UIStateService);
  menuService = inject(MenuService);
  authService = inject(AuthService);
  
  menus = this.menuService.menus;
  isCollapsed = this.uiService.isSidebarCollapsed;

  toggleSidebar() {
    this.uiService.toggleSidebar();
  }

  getIcon(label: string): string {
    const normalizedLabel = label.toLowerCase().trim();
    const icons: { [key: string]: string } = {
      'dashboard': `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"></rect><rect x="14" y="3" width="7" height="7" rx="1"></rect><rect x="14" y="14" width="7" height="7" rx="1"></rect><rect x="3" y="14" width="7" height="7" rx="1"></rect></svg>`,
      'user management': `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`,
      'master setup': `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"></path><path d="M18 12a2 2 0 1 1 0 4 2 2 0 0 1 0-4Z"></path></svg>`,
      'receive module': `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7.5 4.27 9 5.15"></path><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path><path d="m3.3 7 8.7 5 8.7-5"></path><path d="M12 22V12"></path></svg>`,
      'picking module': `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><path d="m9 14 2 2 4-4"></path></svg>`,
      'delivery module': `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 17h4V5H2v12h3"></path><path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5"></path><circle cx="7.5" cy="17.5" r="2.5"></circle><circle cx="17.5" cy="17.5" r="2.5"></circle></svg>`,
      'report': `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="20" x2="12" y2="10"></line><line x1="18" y1="20" x2="18" y2="4"></line><line x1="6" y1="20" x2="6" y2="16"></line></svg>`,
      'help': `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`
    };
    return icons[normalizedLabel] || `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle></svg>`;
  }

  // ✅ Computed menus with fixed URLs to ensure routing works
  sanitizedMenus = computed(() => {
    return this.menus().map(menu => {
      let url = menu.url;
      // Fallback URLs if the API returns incorrect data
      if (!url || url === '/dashboard') {
        const label = menu.displayName.toLowerCase();
        if (label.includes('dashboard')) url = '/dashboard/main';
        else if (label.includes('user')) url = '/dashboard/users';
        else if (label.includes('master')) url = '/dashboard/master';
        else if (label.includes('receive')) url = '/dashboard/receive';
        else if (label.includes('picking')) url = '/dashboard/picking';
        else if (label.includes('delivery')) url = '/dashboard/delivery';
        else if (label.includes('report')) url = '/dashboard/report';
        else if (label.includes('help')) url = '/dashboard/help';
      }
      return { ...menu, url };
    });
  });

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