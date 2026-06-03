import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import * as XLSX from 'xlsx';

import { StorageService } from '../../../../core/services/storage.service';
import { MenuResponse } from '../../../../core/models/MenuResponse';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';
import { PalleteGenerateService } from '../../../../core/services/receiveServices/pallete-generate-service';


// ── Interfaces (move to core/models/warehouse/ if preferred) ───────────
export interface PalletGenerateItem {
  sku: string;
  skuName: string;
  palletCount: number;
  currentPalletCount: number;
  batchNo: string;
  date: string;
}

export interface PalletRecord {
  skuCode: string;
  skuName: string;
  location: string;
  palletNo: string;
  date: string;
}

@Component({
  selector: 'app-generate-pallet',
  imports: [CommonModule],
  templateUrl: './generate-pallet.html',
  styleUrl: './generate-pallet.scss',
})
export class GeneratePallet implements OnInit {
  private palletService  = inject(PalleteGenerateService);
  private toastr         = inject(ToastrService);
  private errorHandler   = inject(ErrorHandlerService);
  private storageService = inject(StorageService);

  // ── State ────────────────────────────────────────────────────────────
  palletList    = signal<PalletGenerateItem[]>([]);
  selectedItem  = signal<PalletGenerateItem | null>(null);
  withDate      = signal(false);
  searchQuery   = signal('');
  palletRecords = signal<PalletRecord[]>([]);
  isLoading     = signal(false);
  isSearching   = signal(false);

  // ── Permissions ──────────────────────────────────────────────────────
  permissions = signal({
    canView: false,
    canCreate: false,
    canUpdate: false,
    canDelete: false,
  });

  canView   = computed(() => this.permissions().canView);
  canCreate = computed(() => this.permissions().canCreate);
  canUpdate = computed(() => this.permissions().canUpdate);
  canDelete = computed(() => this.permissions().canDelete);

  // ── Lifecycle ────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.loadPermissionsFromStorage();
    if (this.canView()) {
      this.loadPalletGenerateList();
    }
  }

  private loadPermissionsFromStorage(): void {
    debugger;
    const menus = this.storageService.getAngularItem<MenuResponse[]>('menus');
    const parentMenu = menus?.find(
      (m) => m.name?.toUpperCase() === 'RECEIVE_MODULE' || m.url?.toLowerCase() === '/receive'
    );
    const palletMenu = parentMenu?.children?.find(
      (c) =>
        c.url?.toLowerCase() === '/pallet-generate' ||
        c.name?.toUpperCase() === 'GENERATE_PALLET'
    );

    if (!palletMenu) {
      this.permissions.set({ canView: false, canCreate: false, canUpdate: false, canDelete: false });
      return;
    }

    this.permissions.set({
      canView:   !!palletMenu.canView,
      canCreate: !!palletMenu.canCreate,
      canUpdate: !!palletMenu.canUpdate,
      canDelete: !!palletMenu.canDelete,
    });
  }

  // ── Load top table data ──────────────────────────────────────────────
  loadPalletGenerateList(): void {
    this.isLoading.set(true);
    this.palletService.getPalletGenerateList().subscribe({
      next: (res) => {
        if (res.success) {
          this.palletList.set(res.data);
        } else {
          this.toastr.error(res.message, 'Error');
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorHandler.handleErrorWithToster(err);
        this.isLoading.set(false);
      },
    });
  }

  // ── Row selection ────────────────────────────────────────────────────
  selectRow(item: PalletGenerateItem): void {
    this.selectedItem.set(item);
  }

  isSelected(item: PalletGenerateItem): boolean {
    const sel = this.selectedItem();
    return !!sel && sel.batchNo === item.batchNo && sel.sku === item.sku;
  }

  clearSelection(): void {
    this.selectedItem.set(null);
    this.withDate.set(false);
  }

  // ── With Date toggle ─────────────────────────────────────────────────
  onWithDateChange(checked: boolean): void {
    this.withDate.set(checked);
  }

  // ── Save & Print ─────────────────────────────────────────────────────
  saveAndPrint(): void {
    const item = this.selectedItem();
    if (!item) return;

    const payload = {
      sku: item.sku,
      skuName: item.skuName,
      batchNo: item.batchNo,
      palletCount: item.palletCount,
      currentPalletCount: item.currentPalletCount,
      withDate: this.withDate(),
    };

    this.isLoading.set(true);
    this.palletService.generatePallet(payload).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastr.success('Pallet generated successfully.', 'Success');
          this.loadPalletGenerateList();
          // Trigger browser print dialog if needed
          // window.print();
        } else {
          this.toastr.error(res.message, 'Error');
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorHandler.handleErrorWithToster(err);
        this.isLoading.set(false);
      },
    });
  }

  // ── Search pallet records ────────────────────────────────────────────
  onSearchChange(value: string): void {
    this.searchQuery.set(value);
  }

  searchRecords(): void {
    const query = this.searchQuery().trim();
    if (!query) {
      this.toastr.warning('Please enter a search term.', 'Warning');
      return;
    }

    this.isSearching.set(true);
    this.palletService.searchPalletRecords(query).subscribe({
      next: (res) => {
        if (res.success) {
          this.palletRecords.set(res.data);
        } else {
          this.toastr.error(res.message, 'Error');
        }
        this.isSearching.set(false);
      },
      error: (err) => {
        this.errorHandler.handleErrorWithToster(err);
        this.isSearching.set(false);
      },
    });
  }

  closeSearch(): void {
    this.searchQuery.set('');
    this.palletRecords.set([]);
  }

  // ── Delete pallet record ─────────────────────────────────────────────
  deleteRecord(record: PalletRecord): void {
    if (!this.canDelete()) return;

    this.palletService.deletePalletRecord(record.palletNo).subscribe({
      next: (res) => {
        if (res.success) {
          this.palletRecords.update((list) =>
            list.filter((r) => r.palletNo !== record.palletNo)
          );
          this.toastr.success('Pallet record deleted.', 'Success');
          this.loadPalletGenerateList();
        } else {
          this.toastr.error(res.message, 'Error');
        }
      },
      error: (err) => this.errorHandler.handleErrorWithToster(err),
    });
  }

  // ── Export to Excel ──────────────────────────────────────────────────
  exportToExcel(): void {
    if (!this.palletRecords().length) return;
    const ws = XLSX.utils.json_to_sheet(
      this.palletRecords().map((r) => ({
        'SKU Code': r.skuCode,
        'SKU Name': r.skuName,
        Location: r.location,
        'Pallet No': r.palletNo,
        Date: r.date,
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'PalletRecords');
    XLSX.writeFile(wb, 'pallet-records.xlsx');
  }
}