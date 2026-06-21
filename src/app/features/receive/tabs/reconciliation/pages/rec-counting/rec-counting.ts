import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { SkuService } from '../../../../../../core/services/skuServices/sku-service';
import { ReconciliationService } from '../../../../../../core/services/receiveServices/reconciliation-service';
import { AuthService } from '../../../../../../core/services/auth.service';
import { StorageService } from '../../../../../../core/services/storage.service';
import { SkuSetting } from '../../../../../../core/models/setups/sku/sku-setting';
import { HundredPercentReconciliationRequest, LocalReconciliationRequest } from '../../../../../../core/models/receives/reconciliation/reconciliation';

interface ReconciliationRow {
  sku: string;
  skuDesc: string;
  batchNo: string;
  date: string;
  sapQty: number;      // A (Unrestricted Qty)
  wmsStock: number;    // B (Scan Qty)
  physicalQty: number; // C (Physical Qty)
  diffBA: number;      // B - A
  diffBC: number;      // B - C
  diffAC: number;      // A - C
  remarks: string;

  blockedQty: number;
  scanBlockQty: number;
  physicalBlockQty: number;
  variance1: number;
  variance2: number;
  variance3: number;
  variance4: number;
  variance5: number;
  variance6: number;
}

@Component({
  selector: 'app-rec-counting',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './rec-counting.html',
  styleUrls: ['../../reconciliation.scss']
})
export class RecCounting implements OnInit {
  private toastr = inject(ToastrService);
  private skuService = inject(SkuService);
  private reconciliationService = inject(ReconciliationService);
  private authService = inject(AuthService);
  private storageService = inject(StorageService);

  permissions = signal({ canView: true, canCreate: true, canUpdate: true, canDelete: true });
  
  canView = computed(() => this.permissions().canView);
  canCreate = computed(() => this.permissions().canCreate);
  canUpdate = computed(() => this.permissions().canUpdate);
  canDelete = computed(() => this.permissions().canDelete);
  
  fileName = signal('');
  selectedUnit = signal('CS');
  fromDate = signal('');
  toDate = signal('');
  receiveNo = signal('Auto-generated...');
  results = signal<ReconciliationRow[]>([]);
  isLoading = signal(false);

  private selectedFile: File | null = null;
  units = signal<SkuSetting[]>([]);

  ngOnInit(): void {
    this.loadPermissionsFromStorage();
    this.initDates();
    this.loadSkuSettings();
  }

  private loadPermissionsFromStorage(): void {
    const menus = this.storageService.getAngularItem<any[]>('menus');
    const parentMenu = menus?.find(
      (m: any) => m.name?.toUpperCase() === 'RECEIVE_MODULE' || m.url?.toLowerCase() === '/receive'
    );
    const rMenu = parentMenu?.children?.find(
      (c: any) =>
        c.url?.toLowerCase() === '/reconciliation' ||
        c.name?.toUpperCase() === 'RECONCILIATION'
    );

    if (rMenu) {
      this.permissions.set({
        canView: !!rMenu.canView,
        canCreate: !!rMenu.canCreate,
        canUpdate: !!rMenu.canUpdate,
        canDelete: !!rMenu.canDelete,
      });
    }
  }

  private initDates(): void {
    const today = this.getCurrentDateString();
    this.fromDate.set(today);
    this.toDate.set(today);
  }

  private getCurrentDateString(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private loadSkuSettings(): void {
    this.skuService.getSetting().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.units.set(res.data);
          if (res.data.length > 0) {
            this.selectedUnit.set(res.data[0].name);
          }
        }
      },
      error: (err) => {
        console.error('Failed to load Sku settings', err);
      }
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.fileName.set(file.name);
    }
  }

  uploadFile(): void {
    if (!this.selectedFile) {
      this.toastr.warning('Please select a file to upload.', 'Warning');
      return;
    }

    this.isLoading.set(true);

    const selectedSetting = this.units().find(u => u.name === this.selectedUnit());
    const unitQtyStr = selectedSetting ? selectedSetting.qty.toString() : '0';

    const fromDateISO = this.fromDate() ? new Date(this.fromDate()).toISOString() : new Date().toISOString();
    const toDateISO = this.toDate() ? new Date(this.toDate()).toISOString() : new Date().toISOString();

    this.reconciliationService.hundredPercentExcelFileReader(
      this.selectedFile,
      unitQtyStr,
      fromDateISO,
      toDateISO
    ).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res.success && res.data) {
          this.toastr.success('Reconciliation file processed successfully.', 'Success');
          this.mapResults(res.data);
        } else {
          this.toastr.error(res.message || 'Failed to process file.', 'Error');
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        this.toastr.error(err?.message || 'Error uploading file.', 'Error');
      }
    });
  }

  loadLocalData(): void {
    this.isLoading.set(true);

    const selectedSetting = this.units().find(u => u.name === this.selectedUnit());
    const qtyVal = selectedSetting ? selectedSetting.qty : 0;

    const formattedFromDate = this.fromDate() ? new Date(this.fromDate()).toISOString() : new Date().toISOString();
    const formattedToDate = this.toDate() ? new Date(this.toDate()).toISOString() : new Date().toISOString();

    const payload: LocalReconciliationRequest = {
      fromDate: formattedFromDate,
      toDate: formattedToDate,
      shift: 'All',
      settingQty: qtyVal
    };

    this.reconciliationService.getLocal100PercentData(payload).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res.success && res.data) {
          if(res.data.length === 0) {
            this.toastr.info('No local data found for the given criteria.', 'Info');
            this.results.set([]);
            return;
          }
          this.toastr.success('Local data retrieved successfully.', 'Success');
          this.mapResults(res.data);
        } else {
          this.toastr.error(res.message || 'Failed to retrieve local data.', 'Error');
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        this.toastr.error(err?.message || 'Error retrieving local data.', 'Error');
      }
    });
  }

  private mapResults(data: any[]): void {
    if (!data || !Array.isArray(data)) {
      this.results.set([]);
      return;
    }

    const mapped = data.map((item: any) => {
      const sapQty = item.sapQty ?? item.unrestrictedQty ?? 0;
      const wmsStock = item.scanQty ?? item.wmsStock ?? item.deliveryScanQty ?? 0;
      const physicalQty = item.physicalQty ?? 0;
      
      const diffBA = item.variance1 ?? (wmsStock - sapQty);
      const diffBC = item.variance2 ?? (wmsStock - physicalQty);
      const diffAC = item.variance3 ?? (sapQty - physicalQty);

      return {
        sku: item.skucode || item.sku || '',
        skuDesc: item.skuname || item.skuDesc || '',
        batchNo: item.batchNo || '',
        date: item.postingDate || item.date || '',
        sapQty: sapQty,
        wmsStock: wmsStock,
        physicalQty: physicalQty,
        blockedQty: item.blockedQty ?? 0,
        scanBlockQty: item.scanBlockQty ?? 0,
        physicalBlockQty: item.physicalBlockQty ?? 0,
        diffBA: diffBA,
        diffBC: diffBC,
        diffAC: diffAC,
        remarks: item.remarks || '',
        variance1: item.variance1 ?? diffBA,
        variance2: item.variance2 ?? diffBC,
        variance3: item.variance3 ?? diffAC,
        variance4: item.variance4 ?? 0,
        variance5: item.variance5 ?? 0,
        variance6: item.variance6 ?? 0
      };
    });

    this.results.set(mapped);
  }

  onSapQtyChange(item: ReconciliationRow, newQty: any): void {
    const qty = Number(newQty) || 0;
    item.sapQty = qty;
    item.diffBA = item.wmsStock - qty;
    item.diffAC = qty - item.physicalQty;

    item.variance1 = item.diffBA;
    item.variance3 = item.diffAC;

    // Trigger signal update
    this.results.set([...this.results()]);
  }

  onWmsStockChange(item: ReconciliationRow, newQty: any): void {
    const qty = Number(newQty) || 0;
    item.wmsStock = qty;
    item.diffBA = qty - item.sapQty;
    item.diffBC = qty - item.physicalQty;

    item.variance1 = item.diffBA;
    item.variance2 = item.diffBC;

    // Trigger signal update
    this.results.set([...this.results()]);
  }

  onPhysicalQtyChange(item: ReconciliationRow, newQty: any): void {
    const qty = Number(newQty) || 0;
    item.physicalQty = qty;
    item.diffBC = item.wmsStock - qty;
    item.diffAC = item.sapQty - qty;

    item.variance2 = item.diffBC;
    item.variance3 = item.diffAC;

    // Trigger signal update
    this.results.set([...this.results()]);
  }

  clearData(): void {
    this.fileName.set('');
    this.selectedFile = null;
    this.selectedUnit.set('CS');
    this.initDates();
    this.results.set([]);
    this.receiveNo.set('Auto-generated...');
  }

  saveData(): void {
    if (this.results().length === 0) {
      this.toastr.warning('No reconciliation results to save.', 'Warning');
      return;
    }

    const selectedSetting = this.units().find(u => u.name === this.selectedUnit());
    const qtyValStr = selectedSetting ? selectedSetting.qty.toString() : '0';
    const userName = this.authService.getLocalStorageUserName() || 'foysal';

    const formattedFromDate = this.fromDate() ? new Date(this.fromDate()).toISOString() : new Date().toISOString();
    const formattedToDate = this.toDate() ? new Date(this.toDate()).toISOString() : new Date().toISOString();

    const list100Counting = this.results().map(item => ({
      skucode: item.sku,
      skuname: item.skuDesc,
      bum: this.selectedUnit(),
      batchNo: item.batchNo,
      unrestrictedQty: item.sapQty,
      blockedQty: item.blockedQty,
      scanQty: item.wmsStock,
      scanBlockQty: item.scanBlockQty,
      physicalQty: item.physicalQty,
      physicalBlockQty: item.physicalBlockQty,
      remarks: item.remarks || '',
      variance1: item.diffBA,
      variance2: item.diffBC,
      variance3: item.diffAC,
      variance4: item.variance4,
      variance5: item.variance5,
      variance6: item.variance6
    }));

    const payload: HundredPercentReconciliationRequest = {
      list100Counting: list100Counting,
      settingQty: qtyValStr,
      dateFrom: formattedFromDate,
      dateTo: formattedToDate,
      reconcilationNo: this.receiveNo() === 'Auto-generated...' ? '' : this.receiveNo(),
      userName: userName
    };

    this.isLoading.set(true);
    this.reconciliationService.hundredPercentReconciliation(payload).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res.success) {
          this.toastr.success(res.message || 'Reconciliation results saved successfully.', 'Success');
          this.clearData();
        } else {
          this.toastr.error(res.message || 'Failed to save reconciliation results.', 'Error');
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        this.toastr.error(err?.message || 'Error saving reconciliation results.', 'Error');
      }
    });
  }

  printResults(): void {
    this.toastr.info('Printing reconciliation results...', 'Print');
    window.print();
  }
}
