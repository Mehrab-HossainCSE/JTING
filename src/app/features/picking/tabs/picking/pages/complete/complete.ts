import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PickingService } from '../../../../../../core/services/pickingServices/picking-service';
import { ReconciliationService } from '../../../../../../core/services/receiveServices/reconciliation-service';
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
  private reconciliationService = inject(ReconciliationService);
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
  totalQty = computed(() => {
    return this.detailsList().reduce((sum, item) => sum + (item.qty || 0), 0);
  });

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
            pickingId: item.challanNo || item.pickingNo || '',
            pickingDate: item.createDate ? new Date(item.createDate).toLocaleDateString() : '---',
            fullPallet: item.fullPaletQty || item.palletQty || 0,
            uniqueKey: (item.challanNo || item.pickingNo) ? `${item.challanNo || item.pickingNo}_${idx}` : `row_${idx}`,
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
    const trackingNo = original.challanNo || original.pickingNo;
    if (!trackingNo) {
      this.toastr.warning('Picking No is null.', 'Warning');
      this.detailsList.set([]);
      return;
    }

    this.isLoadingDetail.set(true);
    this.pickingService.getDetails(trackingNo).subscribe({
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

  private printBlob(pdfBlob: Blob): void {
    const fileURL = window.URL.createObjectURL(pdfBlob);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Print Picking Slip</title>
            <style>
              body, html { margin: 0; padding: 0; height: 100%; overflow: hidden; }
              iframe { width: 100%; height: 100%; border: none; }
            </style>
          </head>
          <body>
            <iframe id="pdfFrame" src="${fileURL}"></iframe>
            <script>
              const iframe = document.getElementById('pdfFrame');
              iframe.onload = function() {
                setTimeout(function() {
                  iframe.contentWindow.focus();
                  iframe.contentWindow.print();
                }, 500);
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    } else {
      this.toastr.error('Could not open print window. Please allow popups.', 'Error');
    }
  }

  onPrint() {
    const id = this.selectedPickingNo();
    if (!id) {
      this.toastr.warning('Please select a picking list to print.', 'Warning');
      return;
    }

    this.isLoadingDetail.set(true);
    this.reconciliationService.printPickingSlip(id).subscribe({
      next: (pdfBlob) => {
        this.isLoadingDetail.set(false);
        this.printBlob(pdfBlob);
      },
      error: (err) => {
        this.isLoadingDetail.set(false);
        this.errorHandler.handleErrorWithToster(err);
      }
    });
  }
}
