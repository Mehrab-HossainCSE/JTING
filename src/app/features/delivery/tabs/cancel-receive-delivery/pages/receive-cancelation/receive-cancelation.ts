import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { SkuService } from '../../../../../../core/services/skuServices/sku-service';
import { CancellationService } from '../../../../../../core/services/cancellationServices/cancellation.service';
import { Sku } from '../../../../../../core/models/setups/sku/sku';
import { SkuSetting } from '../../../../../../core/models/setups/sku/sku-setting';
import { ToastrService } from 'ngx-toastr';
import { LoaderService } from '../../../../../../core/services/loader.service';
import { ReceiveCancellationSaveRequest } from '../../../../../../core/models/cancellation/cancellation.model';
import { ErrorHandlerService } from '../../../../../../core/services/error-handler.service';

export interface SequenceRecord {
  seqNo: string;
  isChecked: boolean;
  barcode?: string;
}

export interface CancelItem {
  skuName: string;
  seqNo: string;
  qty: number;
  barcode?: string;
}

@Component({
  selector: 'app-receive-cancelation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './receive-cancelation.html',
  styleUrl: './receive-cancelation.scss'
})
export class ReceiveCancelation implements OnInit {

  private skuService = inject(SkuService);
  private cancellationService = inject(CancellationService);
  private toastr = inject(ToastrService);
  private loader = inject(LoaderService);
  private errorHandler = inject(ErrorHandlerService);

  selectedSku = signal('');
  selectedBox = signal('');
  selectedPallet = signal('');
  selectedQty = signal('');
  cancellationDate = signal(new Date().toISOString().split('T')[0]);
  remarks = signal('');

  skus = signal<Sku[]>([]);
  boxes = signal<string[]>([]);
  pallets = signal<string[]>([]);
  qtyOptions = signal<SkuSetting[]>([]);

  skuDisplay = signal('0');
  batchDisplay = signal('0');
  palletDisplay = signal('0');
  recvDateDisplay = signal('0');
  shiftDisplay = signal('0');

  sequenceList = signal<SequenceRecord[]>([]);
  allSelectChecked = signal(false);

  cancelItems = signal<CancelItem[]>([]);

  totalCase = signal(0);
  totalQty = signal(0);

  isLoading = signal(false);

  ngOnInit(): void {
    this.cancellationDate.set(new Date().toISOString().split('T')[0]);
    this.loadDropdownData();
  }

  loadDropdownData(): void {
    this.isLoading.set(true);
    forkJoin({
      skus: this.skuService.getAll(),
      skuSettings: this.skuService.getSetting()
    }).subscribe({
      next: ({ skus, skuSettings }) => {
        if (skus.success) this.skus.set(skus.data);
        if (skuSettings.success) {
          this.qtyOptions.set(skuSettings.data);
          const kuOption = skuSettings.data.find(opt => opt.name?.toUpperCase() === 'KU');
          if (kuOption) {
            this.selectedQty.set(String(kuOption.qty));
          }
        }
      },
      error: (err) => {
        console.error('Failed to load SKU dropdown data:', err);
        this.isLoading.set(false);
      },
      complete: () => this.isLoading.set(false)
    });
  }

  onSkuChange(): void {
    const skuCode = this.selectedSku();
    if (!skuCode) {
      this.resetMetadata();
      this.sequenceList.set([]);
      this.boxes.set([]);
      this.pallets.set([]);
      this.selectedBox.set('');
      this.selectedPallet.set('');
      this.allSelectChecked.set(false);
      return;
    }

    this.isLoading.set(true);
    this.cancellationService.getSkuCancelDetails(skuCode).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.skuDisplay.set(skuCode);

          const boxList = res.data.boxes ? res.data.boxes.filter(box => box !== null && box !== undefined && box.trim() !== '') : [];
          this.boxes.set(boxList);

          const palletList = res.data.pallets ? res.data.pallets.filter(plt => plt !== null && plt !== undefined && plt.trim() !== '') : [];
          this.pallets.set(palletList);

          this.sequenceList.set([]);
          this.selectedBox.set('');
          this.selectedPallet.set('');
          this.allSelectChecked.set(false);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load SKU cancel details:', err);
        this.isLoading.set(false);
      }
    });
  }

  onDropdownChange(): void {
    const boxName = this.selectedBox();
    const palletNo = this.selectedPallet();

    if (boxName) {
      this.loadBoxDetails(boxName);
    } else if (palletNo) {
      this.loadPalletDetails(palletNo);
    } else {
      this.resetMetadata();
      this.sequenceList.set([]);
      this.allSelectChecked.set(false);
    }
  }

  loadBoxDetails(boxName: string): void {
    this.isLoading.set(true);
    this.cancellationService.getReceiveBoxDetails(boxName).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          const details: any[] = Array.isArray(res.data) ? res.data : [];
          if (details.length > 0) {
            const first = details[0];
            this.skuDisplay.set(first.skuCode || this.selectedSku());
            this.batchDisplay.set(first.batchNo || '0');
            this.palletDisplay.set(first.palletNo || '0');

            this.recvDateDisplay.set(this.formatRcvDate(first.rcvDate));

            this.shiftDisplay.set(first.shift || '0');

            this.sequenceList.set(details.map(item => ({
              seqNo: item.sequenceNo || item.barcode || '',
              isChecked: false,
              barcode: item.barcode || ''
            })).filter(s => s.seqNo !== ''));
          } else {
            this.sequenceList.set([]);
          }
          this.allSelectChecked.set(false);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load box details:', err);
        this.isLoading.set(false);
      }
    });
  }

  loadPalletDetails(palletNo: string): void {
    this.isLoading.set(true);
    this.cancellationService.getReceivePalletDetails(palletNo).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          const details: any[] = Array.isArray(res.data) ? res.data : [];
          if (details.length > 0) {
            const first = details[0];
            this.skuDisplay.set(first.skuCode || this.selectedSku());
            this.batchDisplay.set(first.batchNo || '0');
            this.palletDisplay.set(first.palletNo || palletNo);

            this.recvDateDisplay.set(this.formatRcvDate(first.rcvDate));

            this.shiftDisplay.set(first.shift || '0');

            this.sequenceList.set(details.map(item => ({
              seqNo: item.sequenceNo || item.barcode || '',
              isChecked: false,
              barcode: item.barcode || ''
            })).filter(s => s.seqNo !== ''));
          } else {
            this.sequenceList.set([]);
          }
          this.allSelectChecked.set(false);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load pallet details:', err);
        this.isLoading.set(false);
      }
    });
  }

  private formatRcvDate(dateStr: string | null | undefined): string {
    if (!dateStr) return '0';

    const normalizedStr = dateStr.replace(/\s+/g, ' ').trim();
    const date = new Date(normalizedStr);
    if (!isNaN(date.getTime())) {
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const dd = String(date.getDate()).padStart(2, '0');
      const yyyy = date.getFullYear();
      return `${mm}/${dd}/${yyyy}`;
    }

    const parts = normalizedStr.split(' ');
    if (parts.length >= 3) {
      const months: { [key: string]: string } = {
        jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
        jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12'
      };
      const monthKey = parts[0].toLowerCase().substring(0, 3);
      const mm = months[monthKey];
      const dd = parts[1].padStart(2, '0');
      const yyyy = parts[2];

      if (mm && !isNaN(Number(dd)) && !isNaN(Number(yyyy)) && yyyy.length === 4) {
        return `${mm}/${dd}/${yyyy}`;
      }
    }

    return dateStr;
  }

  onQtyChange(): void {
    const qtyVal = Number(this.selectedQty());
    if (qtyVal > 0) {
      this.cancelItems.update(list => list.map(item => ({ ...item, qty: qtyVal })));
      this.updateTotals();
    }
  }

  toggleAllSelect(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.allSelectChecked.set(checked);
    this.sequenceList.update(list => list.map(item => ({ ...item, isChecked: checked })));
  }

  onAdd(): void {
    const skuObj = this.skus().find(s => s.skucode === this.selectedSku());
    if (!skuObj) return;

    const checkedItems = this.sequenceList().filter(item => item.isChecked);
    if (checkedItems.length === 0) return;

    const defaultQty = Number(this.selectedQty()) || 30;

    const newCancelItems: CancelItem[] = checkedItems.map(item => ({
      skuName: skuObj.skuname,
      seqNo: item.seqNo,
      qty: defaultQty,
      barcode: item.barcode
    }));

    this.cancelItems.update(list => {
      const filtered = list.filter(l => !newCancelItems.some(n => n.seqNo === l.seqNo));
      return [...filtered, ...newCancelItems];
    });

    this.sequenceList.update(list => list.filter(item => !item.isChecked));
    this.allSelectChecked.set(false);

    this.updateTotals();
  }

  onRemoveItem(seqNo: string): void {
    const itemToRemove = this.cancelItems().find(item => item.seqNo === seqNo);
    if (!itemToRemove) return;

    this.cancelItems.update(list => list.filter(item => item.seqNo !== seqNo));

    this.sequenceList.update(list => [...list, {
      seqNo: itemToRemove.seqNo,
      isChecked: false,
      barcode: itemToRemove.barcode
    }]);

    this.updateTotals();
  }

  updateTotals(): void {
    const list = this.cancelItems();
    this.totalCase.set(list.length);
    this.totalQty.set(list.reduce((sum, item) => sum + item.qty, 0));
  }

  onCancel(): void {
    this.selectedSku.set('');
    this.selectedBox.set('');
    this.selectedPallet.set('');
    this.selectedQty.set('');
    this.remarks.set('');
    this.cancelItems.set([]);
    this.sequenceList.set([]);
    this.boxes.set([]);
    this.pallets.set([]);
    this.resetMetadata();
    this.updateTotals();
  }

  resetMetadata(): void {
    this.skuDisplay.set('0');
    this.batchDisplay.set('0');
    this.palletDisplay.set('0');
    this.recvDateDisplay.set('0');
    this.shiftDisplay.set('0');
  }

  onSave(): void {
    const barcodesList = this.cancelItems()
      .map(item => item.barcode)
      .filter((b): b is string => !!b);

    if (barcodesList.length === 0) {
      this.toastr.warning('No items added to cancellation.', 'Warning');
      return;
    }

    const payload: ReceiveCancellationSaveRequest = {
      barcodes: barcodesList,
      pallets: [],
      remarks: this.remarks() || null
    };

    this.loader.show('Saving cancellation...');
    this.cancellationService.saveReceiveCancellation(payload).subscribe({
      next: (res) => {
        this.loader.hide();
        if (res.success) {
          this.toastr.success(res.message || 'Cancellation saved successfully!', 'Success');
          this.onCancel();
        } else {
          this.errorHandler.handleErrorWithToster({ error: res });
        }
      },
      error: (err) => {
        this.loader.hide();
        console.error('Error saving cancellation:', err);
        this.errorHandler.handleErrorWithToster(err);
      }
    });
  }

  onPrint(): void {
    window.print();
  }
}
