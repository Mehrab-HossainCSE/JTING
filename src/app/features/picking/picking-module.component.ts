import { Component, signal, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, NavigationEnd, RouterOutlet } from '@angular/router';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { StorageService } from '../../core/services/storage.service';
import { MenuResponse } from '../../core/models/MenuResponse';

interface PickingTab {
  id: number;
  path: string;
  label: string;
  icon?: string;
}

@Component({
  selector: 'app-picking-module',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterOutlet],
  templateUrl: './picking-module.component.html',
  styleUrl: './picking-module.component.scss'
})
export class PickingModuleComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private storageService = inject(StorageService);
  private destroy$ = new Subject<void>();

  activeTabId = signal(0);
  tabs = signal<PickingTab[]>([]);

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
    
    // Look specifically for the PICKING_MODULE menu item
    const pickingMenu = menus?.find(
      (menu) => menu.name?.toUpperCase() === 'PICKING_MODULE' || menu.url?.toLowerCase() === '/picking'
    );

    if (!pickingMenu?.children?.length) {
      this.tabs.set([]);
      return;
    }

    const dynamicTabs = pickingMenu.children
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

  navigateToTab(tab: PickingTab): void {
    this.activeTabId.set(tab.id);
    this.router.navigate([tab.path], { relativeTo: this.route });
  }
}
