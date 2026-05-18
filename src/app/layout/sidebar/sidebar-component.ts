import { ChangeDetectionStrategy, Component, inject, signal, effect, computed } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { MenuService } from '../../core/services/menu.service';
import { UIStateService } from '../../core/services/ui-state.service';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

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
  sanitizer = inject(DomSanitizer);
  
  // ✅ Static menu list for consistent layout
  staticMenus = signal<any[]>([
    { id: 1,iconName: 'dashboard', displayName: 'Dashboard', url: '/dashboard' },
    { id: 2,iconName: 'users', displayName: 'User Management', url: '/users' },
    { id: 3,iconName: 'master', displayName: 'Master Setup', url: '/master' },
    { id: 4,iconName: 'receive', displayName: 'Receive Module', url: '/receive' },
    { id: 5,iconName: 'picking', displayName: 'Picking Module', url: '/picking' },
    { id: 6,iconName: 'delivery', displayName: 'Delivery Module', url: '/delivery' },
    { id: 7,iconName: 'report', displayName: 'Report', url: '/report' },
    { id: 8,iconName: 'help', displayName: 'Help', url: '/help' }
  ]);

  sanitizedMenus = computed(() => this.staticMenus());
  isCollapsed = this.uiService.isSidebarCollapsed;

  toggleSidebar() {
    this.uiService.toggleSidebar();
  }

  getIcon(label: string): SafeHtml {
    const normalizedLabel = label.toLowerCase().trim();
      const icons: { [key: string]: string } = {
      'dashboard': `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"></rect><rect x="14" y="3" width="7" height="7" rx="1.5" stroke="var(--icon-accent, #00BB31)"></rect><rect x="14" y="14" width="7" height="7" rx="1.5"></rect><rect x="3" y="14" width="7" height="7" rx="1.5"></rect></svg>`,
      'user': `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4" stroke="var(--icon-accent, #00BB31)"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`,
      'master': `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" stroke="var(--icon-accent, #00BB31)"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>`,
      'receive': `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path><polyline points="3.29 7 12 12 20.71 7" stroke="var(--icon-accent, #00BB31)"></polyline><line x1="12" y1="22" x2="12" y2="12"></line></svg>`,
      'picking': `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><path d="M9 14l2 2 4-4" stroke="var(--icon-accent, #00BB31)"></path></svg>`,
      'delivery': `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" stroke="var(--icon-accent, #00BB31)"></polygon><circle cx="5.5" cy="17.5" r="2.5"></circle><circle cx="18.5" cy="17.5" r="2.5"></circle></svg>`,
      'report': `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="20" x2="12" y2="10" stroke="var(--icon-accent, #00BB31)"></line><line x1="18" y1="20" x2="18" y2="4"></line><line x1="6" y1="20" x2="6" y2="16"></line></svg>`,
      'help': `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" stroke="var(--icon-accent, #00BB31)"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`
    };
    // const icons: { [key: string]: string } = {
    //   'dashboard': `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"></rect><rect x="14" y="3" width="7" height="7" rx="1.5" stroke="var(--icon-accent, #00BB31)"></rect><rect x="14" y="14" width="7" height="7" rx="1.5"></rect><rect x="3" y="14" width="7" height="7" rx="1.5"></rect></svg>`,
    //   'user': `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4" stroke="var(--icon-accent, #00BB31)"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`,
    //   'master setup': `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" stroke="var(--icon-accent, #00BB31)"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>`,
    //   'receive module': `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path><polyline points="3.29 7 12 12 20.71 7" stroke="var(--icon-accent, #00BB31)"></polyline><line x1="12" y1="22" x2="12" y2="12"></line></svg>`,
    //   'picking module': `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><path d="M9 14l2 2 4-4" stroke="var(--icon-accent, #00BB31)"></path></svg>`,
    //   'delivery module': `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" stroke="var(--icon-accent, #00BB31)"></polygon><circle cx="5.5" cy="17.5" r="2.5"></circle><circle cx="18.5" cy="17.5" r="2.5"></circle></svg>`,
    //   'report': `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="20" x2="12" y2="10" stroke="var(--icon-accent, #00BB31)"></line><line x1="18" y1="20" x2="18" y2="4"></line><line x1="6" y1="20" x2="6" y2="16"></line></svg>`,
    //   'help': `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" stroke="var(--icon-accent, #00BB31)"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`
    // };
    const svgString = icons[normalizedLabel] || `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle></svg>`;
    return this.sanitizer.bypassSecurityTrustHtml(svgString);
  }

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