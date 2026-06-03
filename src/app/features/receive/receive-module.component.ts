import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, NavigationEnd, RouterOutlet } from '@angular/router';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { StorageService } from '../../core/services/storage.service';
import { MenuResponse } from '../../core/models/MenuResponse';

interface ReceiveTab {
  id: number;
  path: string;
  label: string;
  icon?: string;
}

@Component({
  selector: 'app-receive-module',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterOutlet],
  templateUrl: './receive-module.component.html',
  styleUrl: './receive-module.component.scss'
})
export class ReceiveModuleComponent implements OnInit, OnDestroy {
  
  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private storageService: StorageService
  ) {}

  activeTabId = signal(0);
  tabs = signal<ReceiveTab[]>([]);

  ngOnInit(): void {
    this.loadTabsFromStorage();
    this.syncTabFromRoute();
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      takeUntil(this.destroy$)
    ).subscribe(() => this.syncTabFromRoute());
  }

  private loadTabsFromStorage(): void {
    const menus = this.storageService.getAngularItem<MenuResponse[]>('menus');
    
    // Look specifically for the RECEIVE_MODULE menu item
    const receiveMenu = menus?.find(
      (menu) => menu.name?.toUpperCase() === 'RECEIVE_MODULE' || menu.url?.toLowerCase() === '/receive'
    );

    if (!receiveMenu?.children?.length) {
      this.tabs.set([]);
      return;
    }

    const dynamicTabs = receiveMenu.children
      .filter((child): child is MenuResponse => !!child.url && !!child.displayName)
      .map((child) => ({
        id: child.id,
        path: child.url.replace(/^[\/]+/, ''),
        label: child.displayName,
        icon: child.navIcon || ''
      }));

    this.tabs.set(dynamicTabs);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private syncTabFromRoute(): void {
    const path = this.route.snapshot.firstChild?.routeConfig?.path;
    const match = this.tabs().find((t) => t.path === path);
    if (match) {
      this.activeTabId.set(match.id);
    }
  }

  navigateToTab(tab: ReceiveTab): void {
    this.activeTabId.set(tab.id);
    this.router.navigate([tab.path], { relativeTo: this.route });
  }
}
