import { Component, signal, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, NavigationEnd, RouterOutlet } from '@angular/router';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { StorageService } from '../../core/services/storage.service';
import { MenuResponse } from '../../core/models/MenuResponse';

interface DeliveryTab {
  id: number;
  path: string;
  label: string;
  icon?: string;
}

@Component({
  selector: 'app-delivery-module',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterOutlet],
  templateUrl: './delivery-module.component.html',
  styleUrl: './delivery-module.component.scss'
})
export class DeliveryModuleComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private storageService = inject(StorageService);
  private destroy$ = new Subject<void>();

  activeTabId = signal(0);
  tabs = signal<DeliveryTab[]>([]);

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
    
    // Look specifically for the DELIVERY_MODULE menu item
    const deliveryMenu = menus?.find(
      (menu) => menu.name?.toUpperCase() === 'DELIVERY_MODULE' || menu.url?.toLowerCase() === '/delivery'
    );

    if (!deliveryMenu?.children?.length) {
      this.tabs.set([]);
      return;
    }

    const dynamicTabs = deliveryMenu.children
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

  navigateToTab(tab: DeliveryTab): void {
    this.activeTabId.set(tab.id);
    this.router.navigate([tab.path], { relativeTo: this.route });
  }
}
