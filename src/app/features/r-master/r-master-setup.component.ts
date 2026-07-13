import { Component, signal, computed, OnInit, OnDestroy, inject } from '@angular/core';
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
  selector: 'app-r-master-setup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterOutlet],
  templateUrl: './r-master-setup.component.html',
  styleUrl: './r-master-setup.component.scss'
})
export class RMasterSetupComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private storageService = inject(StorageService);
  
  private destroy$ = new Subject<void>();

  activeTabId = signal(0);
  tabs = signal<MasterTab[]>([]);
  subMenus = signal<{ name: string; tabs: MasterTab[] }[]>([]);
  activeSubMenuName = signal<string | null>(null);

  visibleTabs = computed(() => {
    const subName = this.activeSubMenuName();
    if (subName && this.subMenus().length > 0) {
      const matched = this.subMenus().find((sub) => sub.name === subName);
      return matched ? matched.tabs : [];
    }
    return this.tabs();
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
    const masterMenu = menus?.find(
      (menu) => menu.name?.toUpperCase() === 'R_MASTER_SETUP' || menu.url?.toLowerCase() === '/r-master'
    );

    if (!masterMenu) {
      this.tabs.set([]);
      this.subMenus.set([]);
      return;
    }

    const dynamicSubMenus: { name: string; tabs: MasterTab[] }[] = [];
    let hasNonGeneralSubMenu = false;

    if (masterMenu.subMenus && masterMenu.subMenus.length > 0) {
      masterMenu.subMenus.forEach((sub) => {
        const subName = sub.subMenuName || 'General';
        if (subName.toUpperCase() !== 'GENERAL') {
          hasNonGeneralSubMenu = true;
        }

        const subTabs = (sub.children || [])
          .filter((child): child is MenuResponse => !!child.url && !!child.displayName)
          .map((child) => ({
            id: child.id,
            path: child.url.replace(/^[\/]+/, ''),
            label: child.displayName,
            icon: child.navIcon || ''
          }));

        if (subTabs.length > 0) {
          dynamicSubMenus.push({
            name: subName,
            tabs: subTabs
          });
        }
      });
    }

    if (hasNonGeneralSubMenu) {
      this.subMenus.set(dynamicSubMenus);
      if (dynamicSubMenus.length > 0 && !this.activeSubMenuName()) {
        this.activeSubMenuName.set(dynamicSubMenus[0].name);
      }
      const allTabs = dynamicSubMenus.flatMap((sub) => sub.tabs);
      this.tabs.set(allTabs);
    } else {
      this.subMenus.set([]);
      this.activeSubMenuName.set(null);

      let childrenSource = masterMenu.children || [];
      if (!childrenSource.length && masterMenu.subMenus?.length) {
        childrenSource = masterMenu.subMenus.flatMap(sub => sub.children || []);
      }

      const dynamicTabs = childrenSource
        .filter((child): child is MenuResponse => !!child.url && !!child.displayName)
        .map((child) => ({
          id: child.id,
          path: child.url.replace(/^[\/]+/, ''),
          label: child.displayName,
          icon: child.navIcon || ''
        }));

      this.tabs.set(dynamicTabs);
    }
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
      if (this.subMenus().length > 0) {
        const parentSubMenu = this.subMenus().find(sub =>
          sub.tabs.some(t => t.id === match.id)
        );
        if (parentSubMenu) {
          this.activeSubMenuName.set(parentSubMenu.name);
        }
      }
    }
  }

  navigateToTab(tab: MasterTab): void {
    this.activeTabId.set(tab.id);
    this.router.navigate([tab.path], { relativeTo: this.route });
  }

  selectSubMenu(name: string): void {
    this.activeSubMenuName.set(name);
    
    const subMenu = this.subMenus().find((sub) => sub.name === name);
    if (subMenu && subMenu.tabs.length > 0) {
      const isCurrentTabInSubMenu = subMenu.tabs.some((t) => t.id === this.activeTabId());
      if (!isCurrentTabInSubMenu) {
        this.navigateToTab(subMenu.tabs[0]);
      }
    }
  }
}
