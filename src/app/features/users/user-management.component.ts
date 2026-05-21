import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, NavigationEnd, RouterOutlet } from '@angular/router';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { StorageService } from '../../core/services/storage.service';
import { MenuResponse } from '../../core/models/MenuResponse';

interface UserTab {
  id: number;
  path: string;
  label: string;
  icon?: string;
}

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterOutlet],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.scss'
})
export class UserManagementComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  activeTabId = signal(0);
  tabs = signal<UserTab[]>([]);
  activeChildPath = signal<string | null>(null);

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private storageService: StorageService
  ) {}

  ngOnInit(): void {
    this.loadTabsFromStorage();
    this.syncTabFromRoute();
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      takeUntil(this.destroy$)
    ).subscribe(() => this.syncTabFromRoute());
  }

  private loadTabsFromStorage(): void {
    const menus = this.storageService.getAngularItem<MenuResponse[]>('menus');
    const userMenu = menus?.find(
      (menu) => menu.name?.toUpperCase() === 'USER_MANAGEMENT' || menu.url?.toLowerCase().endsWith('/users')
    );

    if (!userMenu?.children?.length) {
      this.tabs.set([]);
      return;
    }

    const dynamicTabs = userMenu.children
      .filter((child): child is MenuResponse => !!child.displayName && !!child.name)
      .map((child) => ({
        id: child.id,
        path: this.getUserTabPath(child),
        label: child.displayName,
        icon: child.navIcon || ''
      }));

    this.tabs.set(dynamicTabs);
  }

  private getUserTabPath(child: MenuResponse): string {
    const name = child.name?.toUpperCase();
    if (name === 'CREATE_USER') {
      return 'create-user';
    }
    if (name === 'CREATE_ROLE') {
      return 'create-role';
    }
    if (name === 'ASSIGN_MODULE_WITH_ROLE') {
      return 'assign-role';
    }

    if (child.url) {
      const cleaned = child.url.replace(/^[\/]+/, '').toLowerCase();
      if (cleaned === 'users') return 'create-user';
      if (cleaned === 'roles') return 'create-role';
      if (cleaned.startsWith('users/')) {
        return cleaned.slice(cleaned.indexOf('/') + 1).replace(/([a-z])([A-Z])/g, '$1-$2');
      }
      return cleaned.replace(/[\s_]+/g, '-');
    }

    return child.name?.replace(/[\s_]+/g, '-').toLowerCase() || '';
  }

  private syncTabFromRoute(): void {
    const path = this.route.snapshot.firstChild?.routeConfig?.path ?? null;
    this.activeChildPath.set(path);
    const match = this.tabs().find((tab) => tab.path === path);
    if (match) {
      this.activeTabId.set(match.id);
    }
  }

  hasActiveChild(): boolean {
    return !!this.activeChildPath();
  }

  navigateToTab(tab: UserTab): void {
    this.activeTabId.set(tab.id);
    const commands = tab.path ? [tab.path] : [''];
    this.router.navigate(commands, { relativeTo: this.route });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  selectedUser: string = '';
  users: string[] = ['Admin', 'Manager', 'Store Keeper', 'Sales Executive'];

  menuSections = [
    {
      title: 'Home',
      isSelected: false,
      allView: false,
      allAdd: false,
      allEdit: false,
      allDelete: false,
      isOpen: true,
      items: [
        { name: 'Quick Access', isSelected: false, view: false, add: false, edit: false, delete: false },
        { name: 'Recent Activity', isSelected: false, view: false, add: false, edit: false, delete: false },
        { name: 'Notifications', isSelected: false, view: false, add: false, edit: false, delete: false },
        { name: 'System Health', isSelected: false, view: false, add: false, edit: false, delete: false },
        { name: 'Statistics', isSelected: false, view: false, add: false, edit: false, delete: false }
      ]
    },
    {
      title: 'Settings',
      isSelected: false,
      allView: false,
      allAdd: false,
      allEdit: false,
      allDelete: false,
      isOpen: true,
      items: [
        { name: 'Category', isSelected: false, view: false, add: false, edit: false, delete: false },
        { name: 'Sub-Category', isSelected: false, view: false, add: false, edit: false, delete: false },
        { name: 'Product Name', isSelected: false, view: false, add: false, edit: false, delete: false },
        { name: 'Brand', isSelected: false, view: false, add: false, edit: false, delete: false },
        { name: 'Product Attribute', isSelected: false, view: false, add: false, edit: false, delete: false },
        { name: 'Product Entry', isSelected: false, view: false, add: false, edit: false, delete: false },
        { name: 'Attribute Value', isSelected: false, view: false, add: false, edit: false, delete: false },
        { name: 'Vendor', isSelected: false, view: false, add: false, edit: false, delete: false },
        { name: 'Priority', isSelected: false, view: false, add: false, edit: false, delete: false },
        { name: 'Product', isSelected: false, view: false, add: false, edit: false, delete: false },
        { name: 'Delivery Person', isSelected: false, view: false, add: false, edit: false, delete: false },
        { name: 'Store Requisition Permission', isSelected: false, view: false, add: false, edit: false, delete: false },
        { name: 'Product Bulk Update', isSelected: false, view: false, add: false, edit: false, delete: false },
        { name: 'Courier Service', isSelected: false, view: false, add: false, edit: false, delete: false }
      ]
    },
    {
      title: 'Inventory Tracking System',
      isSelected: false,
      allView: false,
      allAdd: false,
      allEdit: false,
      allDelete: false,
      isOpen: true,
      items: [
        { name: 'InvPrepareSeason', isSelected: false, view: false, add: false, edit: false, delete: false },
        { name: 'InvScanBarcode', isSelected: false, view: false, add: false, edit: false, delete: false },
        { name: 'InvFinalPost', isSelected: false, view: false, add: false, edit: false, delete: false },
        { name: 'InvReportView', isSelected: false, view: false, add: false, edit: false, delete: false },
        { name: 'InvAdjustment', isSelected: false, view: false, add: false, edit: false, delete: false }
      ]
    },
    {
      title: 'Dashboard',
      isSelected: false,
      allView: false,
      allAdd: false,
      allEdit: false,
      allDelete: false,
      isOpen: true,
      items: [
        { name: 'Sales Overview', isSelected: false, view: false, add: false, edit: false, delete: false },
        { name: 'Inventory Stats', isSelected: false, view: false, add: false, edit: false, delete: false },
        { name: 'User Performance', isSelected: false, view: false, add: false, edit: false, delete: false },
        { name: 'Revenue Report', isSelected: false, view: false, add: false, edit: false, delete: false },
        { name: 'Monthly Summary', isSelected: false, view: false, add: false, edit: false, delete: false },
        { name: 'Order Status', isSelected: false, view: false, add: false, edit: false, delete: false },
        { name: 'Customer Insights', isSelected: false, view: false, add: false, edit: false, delete: false }
      ]
    },
    {
      title: 'Inventory',
      isSelected: false,
      allView: false,
      allAdd: false,
      allEdit: false,
      allDelete: false,
      isOpen: true,
      items: [
        { name: 'Reprint', isSelected: false, view: false, add: false, edit: false, delete: false },
        { name: 'Purchase Receive By Style', isSelected: false, view: false, add: false, edit: false, delete: false },
        { name: 'Purchase Receive By Barcode', isSelected: false, view: false, add: false, edit: false, delete: false },
        { name: 'Purchase Receive', isSelected: false, view: false, add: false, edit: false, delete: false },
        { name: 'Barcode Print', isSelected: false, view: false, add: false, edit: false, delete: false },
        { name: 'Store Delivery', isSelected: false, view: false, add: false, edit: false, delete: false },
        { name: 'Store Delivery Fashion', isSelected: false, view: false, add: false, edit: false, delete: false },
        { name: 'Purchase Return', isSelected: false, view: false, add: false, edit: false, delete: false },
        { name: 'Store Delivery By Style', isSelected: false, view: false, add: false, edit: false, delete: false },
        { name: 'Damage and Lost', isSelected: false, view: false, add: false, edit: false, delete: false },
        { name: 'ECOM Receive', isSelected: false, view: false, add: false, edit: false, delete: false },
        { name: 'Receive From Shop', isSelected: false, view: false, add: false, edit: false, delete: false },
        { name: 'Barcode Print Product', isSelected: false, view: false, add: false, edit: false, delete: false },
        { name: 'Requisition Approval', isSelected: false, view: false, add: false, edit: false, delete: false }
      ]
    },
    {
      title: 'Promotion',
      isSelected: false,
      allView: false,
      allAdd: false,
      allEdit: false,
      allDelete: false,
      isOpen: true,
      items: [
        { name: 'Discount Promotion', isSelected: false, view: false, add: false, edit: false, delete: false },
        { name: 'Price Change', isSelected: false, view: false, add: false, edit: false, delete: false },
        { name: 'Price Change (Excel)', isSelected: false, view: false, add: false, edit: false, delete: false },
        { name: 'Promotion Extend', isSelected: false, view: false, add: false, edit: false, delete: false },
        { name: 'Promotion InActive', isSelected: false, view: false, add: false, edit: false, delete: false }
      ]
    },
    {
      title: 'CRM',
      isSelected: false,
      allView: false,
      allAdd: false,
      allEdit: false,
      allDelete: false,
      isOpen: true,
      items: [
        { name: 'Customer Entry', isSelected: false, view: false, add: false, edit: false, delete: false },
        { name: 'Gift Voucher Status Report', isSelected: false, view: false, add: false, edit: false, delete: false },
        { name: 'Gift Voucher Generation', isSelected: false, view: false, add: false, edit: false, delete: false },
        { name: 'Extend Gift Voucher Expiry Date', isSelected: false, view: false, add: false, edit: false, delete: false },
        { name: 'Gift Voucher Delivery By Excel', isSelected: false, view: false, add: false, edit: false, delete: false },
        { name: 'Gift Voucher Delivery To Customer', isSelected: false, view: false, add: false, edit: false, delete: false },
        { name: 'giftvoucher-reactive', isSelected: false, view: false, add: false, edit: false, delete: false }
      ]
    }
  ];

  onSectionToggle(section: any) {
    const isSelected = section.isSelected;
    section.allView = isSelected;
    section.allAdd = isSelected;
    section.allEdit = isSelected;
    section.allDelete = isSelected;
    
    section.items.forEach((item: any) => {
      item.isSelected = isSelected;
      item.view = isSelected;
      item.add = isSelected;
      item.edit = isSelected;
      item.delete = isSelected;
    });
  }

  onPermissionToggle(section: any, permission: string) {
    const propName = 'all' + permission.charAt(0).toUpperCase() + permission.slice(1);
    const isSelected = section[propName];
    section.items.forEach((item: any) => {
      item[permission] = isSelected;
    });
  }

  onItemToggle(section: any, item: any) {
    item.view = item.isSelected;
    item.add = item.isSelected;
    item.edit = item.isSelected;
    item.delete = item.isSelected;
  }
}
