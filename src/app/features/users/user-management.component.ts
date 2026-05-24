import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, NavigationEnd, RouterOutlet } from '@angular/router';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { StorageService } from '../../core/services/storage.service';
import { MenuResponse } from '../../core/models/MenuResponse';

interface UserTab {
  id: number;
  path: string;
  label: string;
  icon?: string;
}

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterOutlet],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.scss'
})
export class UserManagementComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  activeTabId = signal(0);
  tabs = signal<UserTab[]>([]);
  activeChildPath = signal<string | null>(null);

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private storageService: StorageService
  ) {}

  ngOnInit(): void {
    this.loadTabsFromStorage();
    this.syncTabFromRoute();
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      takeUntil(this.destroy$)
    ).subscribe(() => this.syncTabFromRoute());
  }

  private loadTabsFromStorage(): void {
    const menus = this.storageService.getAngularItem<MenuResponse[]>('menus');
    const userMenu = menus?.find(
      (menu) => menu.name?.toUpperCase() === 'USER_MANAGEMENT' || menu.url?.toLowerCase().endsWith('/users')
    );

    if (!userMenu?.children?.length) {
      this.tabs.set([]);
      return;
    }

    const dynamicTabs = userMenu.children
      .filter((child): child is MenuResponse => !!child.displayName && !!child.name)
      .map((child) => ({
        id: child.id,
        path: this.getUserTabPath(child),
        label: child.displayName,
        icon: child.navIcon || ''
      }));

    this.tabs.set(dynamicTabs);
  }

  private getUserTabPath(child: MenuResponse): string {
    const name = child.name?.toUpperCase();
    if (name === 'CREATE_USER') {
      return 'create-user';
    }
    if (name === 'CREATE_ROLE') {
      return 'create-role';
    }
    if (name === 'ASSIGN_MODULE_WITH_ROLE') {
      return 'assign-role';
    }

    if (child.url) {
      const cleaned = child.url.replace(/^[\/]+/, '').toLowerCase();
      if (cleaned === 'users') return 'create-user';
      if (cleaned === 'roles') return 'create-role';
      if (cleaned.startsWith('users/')) {
        return cleaned.slice(cleaned.indexOf('/') + 1).replace(/([a-z])([A-Z])/g, '$1-$2');
      }
      return cleaned.replace(/[\s_]+/g, '-');
    }

    return child.name?.replace(/[\s_]+/g, '-').toLowerCase() || '';
  }

  private syncTabFromRoute(): void {
    const path = this.route.snapshot.firstChild?.routeConfig?.path ?? null;
    this.activeChildPath.set(path);
    const match = this.tabs().find((tab) => tab.path === path);
    if (match) {
      this.activeTabId.set(match.id);
    }
  }

  hasActiveChild(): boolean {
    return !!this.activeChildPath();
  }

  navigateToTab(tab: UserTab): void {
    this.activeTabId.set(tab.id);
    const commands = tab.path ? [tab.path] : [''];
    this.router.navigate(commands, { relativeTo: this.route });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
