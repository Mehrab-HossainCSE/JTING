import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, NavigationEnd, RouterOutlet } from '@angular/router';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { StorageService } from '../../core/services/storage.service';
import { MenuResponse } from '../../core/models/MenuResponse';

interface MasterTab {
  id: number;
  path: string;
  label: string;
  icon?: string;
}

@Component({
  selector: 'app-master-setup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterOutlet],
  templateUrl: './master-setup.component.html',
  styleUrl: './master-setup.component.scss'
})
export class MasterSetupComponent implements OnInit, OnDestroy {
  
  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private storageService: StorageService
  ) {}

  activeTabId = signal(0);
  tabs = signal<MasterTab[]>([]);

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
    const masterMenu = menus?.find(
      (menu) => menu.name?.toUpperCase() === 'MASTER_SETUP' || menu.url?.toLowerCase() === '/master'
    );

    if (!masterMenu?.children?.length) {
      this.tabs.set([]);
      return;
    }

    const dynamicTabs = masterMenu.children
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

  navigateToTab(tab: MasterTab): void {
    this.activeTabId.set(tab.id);
    this.router.navigate([tab.path], { relativeTo: this.route });
  }
}