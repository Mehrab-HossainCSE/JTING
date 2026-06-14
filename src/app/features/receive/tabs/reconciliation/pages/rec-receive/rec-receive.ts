import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { SkuService } from '../../../../../../core/services/skuServices/sku-service';
import { BlockService } from '../../../../../../core/services/setupServices/block-service';
import { ArchService } from '../../../../../../core/services/setupServices/arch-service';
import { LineService } from '../../../../../../core/services/setupServices/line-service';

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
  selector: 'app-rec-receive',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './rec-receive.html',
  styleUrls: ['../../reconciliation.scss'] // Reusing parent styles
})
export class RecReceive {
  private toastr = inject(ToastrService);

  private skuService = inject(SkuService);
  private blockService = inject(BlockService);
  private archService = inject(ArchService);
  private lineService = inject(LineService);



  // ── Permissions ──────────────────────────────────────────────────────
  permissions = signal({
    canView: true,
    canCreate: true,
    canUpdate: true,
    canDelete: true,
  });

  canCreate = computed(() => this.permissions().canCreate);

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

  mockResults: ReconciliationRow[] = [
    { sku: '15107995', skuDesc: 'Navy Special Filter 10s', batchNo: 'B-41761090', date: '4/5/2026', sapQty: 100, wmsStock: 98, physicalQty: 98, diffBA: -2, diffBC: 0, diffAC: -2, remarks: 'Minor count difference' },
    { sku: '15107992', skuDesc: 'Navy Special Filter 20s', batchNo: 'B-41761929', date: '4/5/2026', sapQty: 200, wmsStock: 200, physicalQty: 198, diffBA: 0, diffBC: -2, diffAC: -2, remarks: 'Case damaged during loading' },
    { sku: '15108001', skuDesc: 'Navy Option 10s', batchNo: 'B-41762828', date: '4/5/2026', sapQty: 50, wmsStock: 52, physicalQty: 52, diffBA: 2, diffBC: 0, diffAC: 2, remarks: 'Extra carton received' },
  ];

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
    }, 800);
  }

  clearData(): void {
    this.fileName.set('');
    this.selectedUnit.set('CS');
    this.isShiftWise.set(false);
    this.fromDate.set('');
    this.toDate.set('');
    this.results.set([]);
    this.receiveNo.set('Auto-generated...');
  }

  saveData(): void {
    this.toastr.success('Reconciliation results saved successfully.', 'Success');
    this.clearData();
  }

  printResults(): void {
    this.toastr.info('Printing reconciliation results...', 'Print');
    window.print();
  }
}
