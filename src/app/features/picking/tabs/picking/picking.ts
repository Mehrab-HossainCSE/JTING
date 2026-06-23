import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { StorageService } from '../../../../core/services/storage.service';
import { MenuResponse } from '../../../../core/models/MenuResponse';
import { SkuService } from '../../../../core/services/skuServices/sku-service';

@Component({
  selector: 'app-picking-tab',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './picking.html',
  styleUrl: './picking.scss'
})
export class Picking implements OnInit {
  private storageService = inject(StorageService);
  private skuService = inject(SkuService);

  permissions = signal({
    canView: true,
    canCreate: true,
    canUpdate: true,
    canDelete: true,
  });

  canView = computed(() => this.permissions().canView);

  subTabs = [
    { name: 'Start Picking', path: 'start-picking' },
    { name: 'In Progress', path: 'inprogress' },
    { name: 'Complete', path: 'complete' },
  ];

  ngOnInit(): void {
    this.loadPermissionsFromStorage();
  }

  private loadPermissionsFromStorage(): void {
    const menus = this.storageService.getAngularItem<MenuResponse[]>('menus');
    const parentMenu = menus?.find(
      (m) => m.name?.toUpperCase() === 'PICKING_MODULE' || m.url?.toLowerCase() === '/picking'
    );
    const pMenu = parentMenu?.children?.find(
      (c) => c.url?.toLowerCase() === '/picking' || c.name?.toUpperCase() === 'PICKING'
    );

    if (pMenu) {
      this.permissions.set({
        canView: !!pMenu.canView,
        canCreate: !!pMenu.canCreate,
        canUpdate: !!pMenu.canUpdate,
        canDelete: !!pMenu.canDelete,
      });
    }
  }
}