import { Component, signal, computed, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, NavigationEnd, RouterOutlet } from '@angular/router';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { StorageService } from '../../core/services/storage.service';
import { MenuResponse } from '../../core/models/MenuResponse';

interface ReportTab {
  id: number;
  path: string;
  label: string;
  icon?: string;
}

@Component({
  selector: 'app-report',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterOutlet],
  templateUrl: './report.component.html',
  styleUrl: './report.component.scss'
})
export class ReportComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private storageService = inject(StorageService);
  private destroy$ = new Subject<void>();

  activeTabId = signal(0);
  tabs = signal<ReportTab[]>([]);
  searchQuery = signal('');

  filteredTabs = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return this.tabs();
    return this.tabs().filter(tab => tab.label.toLowerCase().includes(query));
  });

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
    
    // Look specifically for the REPORT menu item
    const reportMenu = menus?.find(
      (menu) => menu.name?.toUpperCase() === 'REPORT' || menu.url?.toLowerCase() === '/report'
    );

    if (!reportMenu?.children?.length) {
      this.tabs.set([]);
      return;
    }

    const dynamicTabs = reportMenu.children
      .filter((child): child is MenuResponse => !!child.url && !!child.displayName)
      .map((child) => {
        // Clean URL to match child route path
        // e.g. /report/receive -> receive
        // e.g. /product-receive-report -> product-receive-report
        let path = child.url.replace(/^\/+/, '');
        if (path.startsWith('report/')) {
          path = path.substring(7); // remove report/
        }
        return {
          id: child.id,
          path: path,
          label: child.displayName,
          icon: child.navIcon || '📊'
        };
      });

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

  navigateToTab(tab: ReportTab): void {
    this.activeTabId.set(tab.id);
    this.router.navigate([tab.path], { relativeTo: this.route });
  }
}
