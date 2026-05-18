import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, NavigationEnd, RouterOutlet } from '@angular/router';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

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
    private route: ActivatedRoute
  ) {}

  activeTabId = signal(1);

  tabs = [
    { id: 1, path: 'brand', label: 'Brand Setup', icon: '' },
    { id: 2, path: 'sub-brand', label: 'Sub Brands Setup', icon: '' },
    { id: 3, path: 'external-brand', label: 'External Brand Setup', icon: '' },
    { id: 4, path: 'external-sub-brand', label: 'External Sub Brand Setup', icon: '' },
    { id: 5, path: 'trucks', label: 'Trucks Setup', icon: '' },
    { id: 6, path: 'drivers', label: 'Drivers Setup', icon: '' },
    { id: 7, path: 'destinations', label: 'Destinations Setup', icon: '' },
    { id: 8, path: 'department', label: 'Department Setup', icon: '' },
    { id: 9, path: 'shifts', label: 'Shifts Setup', icon: '' },
    { id: 10, path: 'sku', label: 'SKU Setup', icon: '' },
    { id: 11, path: 'block', label: 'Block Setup', icon: '' },
    { id: 12, path: 'arch', label: 'Arch Setup', icon: '' },
    { id: 13, path: 'line', label: 'Line Setup', icon: '' },
    { id: 14, path: 'box', label: 'Box Setup', icon: '' },
    { id: 15, path: 'layout-assign', label: 'Layout Assign', icon: '' },
    { id: 16, path: 'kpi', label: 'KPI Setup', icon: '' }
  ];

  ngOnInit(): void {
    this.syncTabFromRoute();
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      takeUntil(this.destroy$)
    ).subscribe(() => this.syncTabFromRoute());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private syncTabFromRoute(): void {
    const path = this.route.snapshot.firstChild?.routeConfig?.path;
    const match = this.tabs.find(t => t.path === path);
    if (match) this.activeTabId.set(match.id);
  }

  navigateToTab(tab: typeof this.tabs[0]): void {
    this.activeTabId.set(tab.id);
    this.router.navigate([tab.path], { relativeTo: this.route });
  }
}