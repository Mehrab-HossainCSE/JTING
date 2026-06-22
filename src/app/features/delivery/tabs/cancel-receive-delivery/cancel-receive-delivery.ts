import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { StorageService } from '../../../../core/services/storage.service';
import { MenuResponse } from '../../../../core/models/MenuResponse';

@Component({
  selector: 'app-cancel-receive-delivery-tab',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cancel-receive-delivery.html',
  styleUrl: './cancel-receive-delivery.scss'
})
export class CancelReceiveDelivery implements OnInit {
  private storageService = inject(StorageService);

  permissions = signal({
    canView: true,
    canCreate: true,
    canUpdate: true,
    canDelete: true,
  });

  canView = computed(() => this.permissions().canView);

  subTabs = [
    { name: 'Receive Cancelation', path: 'receive-cancelation' },
    { name: 'Delivery Cancelation', path: 'delivery-cancelation' },
    { name: 'Cancelation Story', path: 'cancelation-story' },
  ];

  ngOnInit(): void {
    this.loadPermissionsFromStorage();
  }

  private loadPermissionsFromStorage(): void {
    const menus = this.storageService.getAngularItem<MenuResponse[]>('menus');
    const parentMenu = menus?.find(
      (m) => m.name?.toUpperCase() === 'DELIVERY_MODULE' || m.url?.toLowerCase() === '/delivery'
    );
    const dMenu = parentMenu?.children?.find(
      (c) =>
        c.url?.toLowerCase() === '/cancel-receive-delivery' ||
        c.url?.toLowerCase() === 'cancel-receive-delivery' ||
        c.name?.toUpperCase() === 'CANCEL_RECEIVE_DELIVERY'
    );

    if (dMenu) {
      this.permissions.set({
        canView: !!dMenu.canView,
        canCreate: !!dMenu.canCreate,
        canUpdate: !!dMenu.canUpdate,
        canDelete: !!dMenu.canDelete,
      });
    }
  }
}
