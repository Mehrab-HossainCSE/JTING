import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { StorageService } from '../../../../core/services/storage.service';
import { MenuResponse } from '../../../../core/models/MenuResponse';

interface ReconciliationRow {
  sku: string;
  skuDesc: string;
  batchNo: string;
  date: string;
  sapQty: number;      // A
  wmsStock: number;    // B
  physicalQty: number; // C
  diffBA: number;      // B - A
  diffBC: number;      // B - C
  diffAC: number;      // A - C
  remarks: string;
}

@Component({
  selector: 'app-reconciliation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reconciliation.html',
  styleUrl: './reconciliation.scss',
})
export class Reconciliation implements OnInit {
  private toastr         = inject(ToastrService);
  private storageService = inject(StorageService);

  // ── Permissions ──────────────────────────────────────────────────────
  permissions = signal({
    canView: true,     // Default to true for design showcase
    canCreate: true,
    canUpdate: true,
    canDelete: true,
  });

  canView = computed(() => this.permissions().canView);
  canCreate = computed(() => this.permissions().canCreate);

  // ── Sub Tabs ─────────────────────────────────────────────────────────
  subTabs: string[] = ['Receive', 'Delivery', '100% Counting', 'Picking Area', 'History'];
  activeSubTab = signal('Receive');

  // ── Upload Parameters ────────────────────────────────────────────────
  fileName = signal('');
  selectedUnit = signal('CS');
  isShiftWise = signal(false);
  fromDate = signal('');
  toDate = signal('');

  // ── Footer State ─────────────────────────────────────────────────────
  receiveNo = signal('Auto-generated...');

  // ── Reconciliation Results ───────────────────────────────────────────
  results = signal<ReconciliationRow[]>([]);
  isLoading = signal(false);

  // ── Static Mock Results on Upload ──
  mockResults: ReconciliationRow[] = [
    { sku: '15107995', skuDesc: 'Navy Special Filter 10s', batchNo: 'B-41761090', date: '4/5/2026', sapQty: 100, wmsStock: 98, physicalQty: 98, diffBA: -2, diffBC: 0, diffAC: -2, remarks: 'Minor count difference' },
    { sku: '15107992', skuDesc: 'Navy Special Filter 20s', batchNo: 'B-41761929', date: '4/5/2026', sapQty: 200, wmsStock: 200, physicalQty: 198, diffBA: 0, diffBC: -2, diffAC: -2, remarks: 'Case damaged during loading' },
    { sku: '15108001', skuDesc: 'Navy Option 10s', batchNo: 'B-41762828', date: '4/5/2026', sapQty: 50, wmsStock: 52, physicalQty: 52, diffBA: 2, diffBC: 0, diffAC: 2, remarks: 'Extra carton received' },
  ];

  // ── Lifecycle ────────────────────────────────────────────────────────
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

  // ── Handlers ─────────────────────────────────────────────────────────
  setSubTab(tab: string): void {
    this.activeSubTab.set(tab);
    this.toastr.info(`Switched to sub-tab: ${tab}`, 'Navigation');
    // For visual demo, clear results when switching to history or delivery
    if (tab !== 'Receive') {
      this.results.set([]);
    } else if (this.fileName()) {
      this.results.set(this.mockResults);
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.fileName.set(file.name);
    }
  }

  uploadFile(): void {
    if (!this.fileName()) {
      this.toastr.warning('Please select a file to upload.', 'Warning');
      return;
    }

    this.isLoading.set(true);
    setTimeout(() => {
      this.results.set(this.mockResults);
      this.isLoading.set(false);
      this.toastr.success('Reconciliation file processed successfully.', 'Success');
    }, 800); // Mock processing delay
  }

  clearData(): void {
    this.fileName.set('');
    this.selectedUnit.set('CS');
    this.isShiftWise.set(false);
    this.fromDate.set('');
    this.toDate.set('');
    this.results.set([]);
    this.receiveNo.set('Auto-generated...');
    this.toastr.info('Data cleared', 'Cleared');
  }

  saveData(): void {
    if (!this.canCreate()) {
      this.toastr.error('You do not have permission to save reconciliation.', 'Access Denied');
      return;
    }

    if (this.results().length === 0) {
      this.toastr.warning('No reconciliation results to save.', 'Warning');
      return;
    }

    this.toastr.success('Reconciliation results saved successfully.', 'Success');
    this.clearData();
  }

  printResults(): void {
    if (this.results().length === 0) {
      this.toastr.warning('No results to print.', 'Warning');
      return;
    }
    this.toastr.info('Printing reconciliation results...', 'Print');
    window.print();
  }
}
