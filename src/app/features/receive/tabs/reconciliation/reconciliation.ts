import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { StorageService } from '../../../../core/services/storage.service';
import { MenuResponse } from '../../../../core/models/MenuResponse';

@Component({
  selector: 'app-reconciliation',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './reconciliation.html',
  styleUrl: './reconciliation.scss',
})
export class Reconciliation implements OnInit {
  private storageService = inject(StorageService);

  // ── Permissions ──────────────────────────────────────────────────────
  permissions = signal({
    canView: true, 
    canCreate: true,
    canUpdate: true,
    canDelete: true,
  });

  canView = computed(() => this.permissions().canView);

  // ── Sub Tabs Config ──────────────────────────────────────────────────
  subTabs = [
    { name: 'Receive', path: 'receive' },
    { name: 'Delivery', path: 'delivery' },
    { name: '100% Counting', path: 'counting' },
    { name: 'Picking Area', path: 'picking' },
    { name: 'History', path: 'history' },
  ];

  ngOnInit(): void {
    this.loadPermissionsFromStorage();
  }

  private loadPermissionsFromStorage(): void {
    const menus = this.storageService.getAngularItem<MenuResponse[]>('menus');
    const parentMenu = menus?.find(
      (m) => m.name?.toUpperCase() === 'RECEIVE_MODULE' || m.url?.toLowerCase() === '/receive'
    );
    const rMenu = parentMenu?.children?.find(
      (c) =>
        c.url?.toLowerCase() === '/reconciliation' ||
        c.name?.toUpperCase() === 'RECONCILIATION'
    );

    if (rMenu) {
      this.permissions.set({
        canView:   !!rMenu.canView,
        canCreate: !!rMenu.canCreate,
        canUpdate: !!rMenu.canUpdate,
        canDelete: !!rMenu.canDelete,
      });
    }
  }
}
