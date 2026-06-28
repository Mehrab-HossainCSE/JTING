import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { StorageService } from '../../../../core/services/storage.service';
import { MenuResponse } from '../../../../core/models/MenuResponse';

@Component({
  selector: 'app-transfer-restore',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './transfer-restore.html',
  styleUrl: './transfer-restore.scss'
})
export class TransferRestore implements OnInit {
  private storageService = inject(StorageService);

  permissions = signal({
    canView: true,
    canCreate: true,
    canUpdate: true,
    canDelete: true,
  });

  canView = computed(() => this.permissions().canView);

  subTabs = [
    { name: 'Transfer', path: 'transfer' },
    { name: 'Restore From PA', path: 'restore-from-pa' },
    { name: 'List Of Transfer', path: 'list-of-transfer' },
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
      (c) =>
        c.url?.toLowerCase() === '/picking/transfer-restore' ||
        c.url?.toLowerCase() === 'transfer-restore' ||
        c.name?.toUpperCase() === 'TRANSFER_RESTORE'
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
