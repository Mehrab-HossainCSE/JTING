import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PickingService } from '../../../../../../core/services/pickingServices/picking-service';
import { ToastrService } from 'ngx-toastr';
import { ErrorHandlerService } from '../../../../../../core/services/error-handler.service';
import { PickingItem } from '../../../../../../core/models/picking/picking';

export interface PickingMaster {
  pickingId: string;
  pickingDate: string;
  fullPallet: number;
  uniqueKey: string;
  originalItem: PickingItem;
}

export interface PickingDetail {
  batch: string;
  receiveDate: string;
  skuDescription: string;
  palletNo: string;
  location: string;
  qty: number;
  pickerName: string;
  pickDone: boolean;
}

@Component({
  selector: 'app-complete',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './complete.html',
  styleUrls: ['./complete.scss']
})
export class Complete implements OnInit {
  private pickingService = inject(PickingService);
  private toastr = inject(ToastrService);
  private errorHandler = inject(ErrorHandlerService);

  // Master Signals
  fromDate = signal(new Date().toISOString().split('T')[0]);
  toDate = signal(new Date().toISOString().split('T')[0]);
  isLoadingMaster = signal(false);
  masterList = signal<PickingMaster[]>([]);
  selectedRowKey = signal<string | null>(null);
  selectedPickingNo = signal<string | null>(null);

  // Detail Signals
  isLoadingDetail = signal(false);
  detailsList = signal<PickingDetail[]>([]);

  ngOnInit(): void {
    this.onSearch();
  }

  onSearch() {
    this.isLoadingMaster.set(true);
    this.pickingService.getCompleteList(this.fromDate(), this.toDate()).subscribe({
      next: (res) => {
        if (res && res.success && res.data) {
          const list = res.data || [];
          const masters = list.map((item, idx) => ({
            pickingId: item.pickingNo || '',
            pickingDate: item.createDate ? new Date(item.createDate).toLocaleDateString() : '---',
            fullPallet: item.fullPaletQty || item.palletQty || 0,
            uniqueKey: item.pickingNo ? `${item.pickingNo}_${idx}` : `row_${idx}`,
            originalItem: item
          }));
          this.masterList.set(masters);
          this.selectedRowKey.set(null);
          this.selectedPickingNo.set(null);
          this.detailsList.set([]);
        } else {
          this.masterList.set([]);
          this.selectedRowKey.set(null);
          this.selectedPickingNo.set(null);
          this.detailsList.set([]);
          this.toastr.info(res?.message || 'No complete records found for the selected range.', 'Info');
        }
        this.isLoadingMaster.set(false);
      },
      error: (err) => {
        this.isLoadingMaster.set(false);
        this.errorHandler.handleErrorWithToster(err);
      }
    });
  }

  onSelectPicking(item: PickingMaster) {
    this.selectedRowKey.set(item.uniqueKey);
    this.selectedPickingNo.set(item.pickingId || null);

    const original = item.originalItem;
    if (!original.pickingNo) {
      this.toastr.warning('Picking No is null.', 'Warning');
      this.detailsList.set([]);
      return;
    }

    this.isLoadingDetail.set(true);
    this.pickingService.getDetails(original.pickingNo).subscribe({
      next: (res) => {
        if (res && res.success && res.data) {
          const mapped = res.data.map(d => ({
            batch: d.batchNo || '---',
            receiveDate: d.rcvDate ? new Date(d.rcvDate).toLocaleDateString() : '---',
            skuDescription: d.skuname || d.skuCode || '---',
            palletNo: d.palletNo || '---',
            location: d.controlName || '---',
            qty: d.qty || 0,
            pickerName: d.pickerName || '---',
            pickDone: true
          }));
          this.detailsList.set(mapped);
        } else {
          this.detailsList.set([]);
        }
        this.isLoadingDetail.set(false);
      },
      error: (err) => {
        this.isLoadingDetail.set(false);
        this.errorHandler.handleErrorWithToster(err);
      }
    });
  }

  onPrint() {
    const id = this.selectedPickingNo() || 'N/A';
    this.toastr.success(`Printing picking log for: ${id}`, 'Print Success');
    window.print();
  }
}
