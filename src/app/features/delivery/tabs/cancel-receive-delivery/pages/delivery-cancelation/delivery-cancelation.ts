import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { LoaderService } from '../../../../../../core/services/loader.service';
import { ErrorHandlerService } from '../../../../../../core/services/error-handler.service';
import { CancellationService } from '../../../../../../core/services/cancellationServices/cancellation.service';
import { SkuService } from '../../../../../../core/services/skuServices/sku-service';
import { SkuSetting } from '../../../../../../core/models/setups/sku/sku-setting';
import { CancelItem, DeliveryCancellationSaveRequest, SequenceRecord, SkuWithoutPicking } from '../../../../../../core/models/cancellation/cancellation.model';

@Component({
  selector: 'app-delivery-cancelation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './delivery-cancelation.html',
  styleUrl: './delivery-cancelation.scss'
})
export class DeliveryCancelation implements OnInit {
  private cancellationService = inject(CancellationService);
  private skuService = inject(SkuService);
  private toastr = inject(ToastrService);
  private loader = inject(LoaderService);
  private errorHandler = inject(ErrorHandlerService);

  selectedChallan = signal('');
  selectedSku = signal('');
  selectedQty = signal('');
  cancellationDate = signal(new Date().toISOString().split('T')[0]);
  remarks = signal('');

  challans = signal<string[]>([]);
  skus = signal<{ code: string; name: string }[]>([]);
  qtyOptions = signal<SkuSetting[]>([]);

  truckNoDisplay = signal('0');
  driverNameDisplay = signal('0');
  destinationDisplay = signal('0');

  sequenceList = signal<SequenceRecord[]>([]);
  allSelectChecked = signal(false);

  cancelItems = signal<CancelItem[]>([]);

  skuWithoutPickingList = signal<SkuWithoutPicking[]>([]);
  rawLocationsList = signal<any[]>([]);
  private originalDetailsMap = new Map<string, any>();

  totalCase = signal(0);
  totalQty = signal(0);

  isLoading = signal(false);

  ngOnInit(): void {
    this.cancellationDate.set(new Date().toISOString().split('T')[0]);
    this.loadChallans();
    this.loadQtyOptions();
  }

  loadQtyOptions(): void {
    this.skuService.getSetting().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.qtyOptions.set(res.data);
          const kuOption = res.data.find(opt => opt.name?.toUpperCase() === 'KU');
          if (kuOption) {
            this.selectedQty.set(String(kuOption.qty));
          }
        }
      },
      error: (err) => {
        console.error('Failed to load qty options:', err);
      }
    });
  }

  loadChallans(): void {
    this.isLoading.set(true);
    this.cancellationService.getChallanNoDatewise().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          const list = res.data.map((item: any) => item.challanNo);
          this.challans.set(list);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load challans:', err);
        this.isLoading.set(false);
      }
    });
  }

  onChallanChange(): void {
    const challanNo = this.selectedChallan();
    if (!challanNo) {
      this.resetDetails();
      this.skus.set([]);
      this.selectedSku.set('');
      this.sequenceList.set([]);
      this.allSelectChecked.set(false);
      return;
    }

    this.isLoading.set(true);
    this.cancellationService.getChallanDetails(challanNo).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          const lines = Array.isArray(res.data) ? res.data : (res.data.items || []);
          if (lines.length > 0) {
            const first = lines[0];
            this.truckNoDisplay.set(first.truckName || first.truckNo || first.vehicleNo || '0');
            this.driverNameDisplay.set(first.driverName || first.driver || '0');
            this.destinationDisplay.set(first.destinationName || first.destination || first.depotName || '0');

            const uniqueSkusMap = new Map<string, string>();
            lines.forEach((item: any) => {
              const code = item.skucode || item.skuCode;
              const name = item.skuname || item.skuName;
              if (code) {
                uniqueSkusMap.set(code, name || code);
              }
            });
            const skuList = Array.from(uniqueSkusMap.entries()).map(([code, name]) => ({ code, name }));
            this.skus.set(skuList);
          } else {
            this.skus.set([]);
            this.resetDetails();
          }
          this.selectedSku.set('');
          this.sequenceList.set([]);
          this.allSelectChecked.set(false);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load challan details:', err);
        this.isLoading.set(false);
      }
    });
  }

  onSkuChange(): void {
    const skuCode = this.selectedSku();
    const challanNo = this.selectedChallan();

    if (!skuCode || !challanNo) {
      this.sequenceList.set([]);
      this.allSelectChecked.set(false);
      return;
    }

    this.isLoading.set(true);
    this.cancellationService.getChallanSkuDetails(skuCode, challanNo).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          const details = Array.isArray(res.data) ? res.data : [];

          details.forEach((item: any) => {
            const seqNo = item.sequenceNo || item.barcode || '';
            if (seqNo) {
              this.originalDetailsMap.set(seqNo, item);
            }
          });

          this.sequenceList.set(details.map((item: any) => ({
            seqNo: item.sequenceNo || item.barcode || '',
            isChecked: false,
            barcode: item.barcode || ''
          })).filter((s: any) => s.seqNo !== ''));
          this.allSelectChecked.set(false);
        } else {
          this.sequenceList.set([]);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load challan SKU details:', err);
        this.isLoading.set(false);
      }
    });
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

  fetchLocationsForSelectedBarcodes(): void {
    const barcodes = this.cancelItems()
      .map(item => item.barcode)
      .filter((b): b is string => !!b);

    if (barcodes.length === 0) {
      this.skuWithoutPickingList.set([]);
      this.rawLocationsList.set([]);
      return;
    }

    this.isLoading.set(true);
    this.cancellationService.getDataForLocation({ barcodes }).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          const list = Array.isArray(res.data) ? res.data : [];
          this.rawLocationsList.set(list);
          this.skuWithoutPickingList.set(list.map((item: any) => ({
            skuName: item.skuName || item.skuname || '',
            batchNo: item.batchNo || '',
            palletNo: item.palletNo || '',
            date: item.rcvDate ? item.rcvDate.split('T')[0] : (item.date ? item.date.split('T')[0] : ''),
            location: item.controlName || item.location || ''
          })));
        } else {
          this.skuWithoutPickingList.set([]);
          this.rawLocationsList.set([]);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load locations for barcodes:', err);
        this.isLoading.set(false);
      }
    });
  }

  onAdd(): void {
    const skuObj = this.skus().find(s => s.code === this.selectedSku());
    if (!skuObj) return;

    const checkedItems = this.sequenceList().filter(item => item.isChecked);
    if (checkedItems.length === 0) return;

    const defaultQty = Number(this.selectedQty()) || 24;

    const newCancelItems: CancelItem[] = checkedItems.map(item => ({
      skuName: skuObj.name,
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
    this.fetchLocationsForSelectedBarcodes();
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
    this.fetchLocationsForSelectedBarcodes();
  }

  updateTotals(): void {
    const list = this.cancelItems();
    this.totalCase.set(list.length);
    this.totalQty.set(list.reduce((sum, item) => sum + item.qty, 0));
  }

  onCancel(): void {
    this.selectedChallan.set('');
    this.selectedSku.set('');
    this.selectedQty.set('');
    this.remarks.set('');
    this.cancelItems.set([]);
    this.sequenceList.set([]);
    this.skuWithoutPickingList.set([]);
    this.rawLocationsList.set([]);
    this.originalDetailsMap.clear();

    this.resetDetails();
    this.updateTotals();
  }

  resetDetails(): void {
    this.truckNoDisplay.set('0');
    this.driverNameDisplay.set('0');
    this.destinationDisplay.set('0');
  }

  onSave(): void {
    const itemsToSave = this.cancelItems().map(item => {
      const orig = this.originalDetailsMap.get(item.seqNo) || {};
      return {
        ...orig,
        qty: item.qty,
        deliverQty: item.qty
      };
    });

    if (itemsToSave.length === 0) {
      this.toastr.warning('No items added to cancellation.', 'Warning');
      return;
    }

    const payload: DeliveryCancellationSaveRequest = {
      items: itemsToSave,
      locations: this.rawLocationsList(),
      remarks: this.remarks() || null
    };

    this.loader.show('Saving delivery cancellation...');
    this.cancellationService.saveDeliveryCancellation(payload).subscribe({
      next: (res) => {
        this.loader.hide();
        if (res.success) {
          this.toastr.success(res.message || 'Delivery cancellation saved successfully!', 'Success');
          this.onCancel();
        } else {
          this.errorHandler.handleErrorWithToster({ error: res });
        }
      },
      error: (err) => {
        this.loader.hide();
        console.error('Error saving delivery cancellation:', err);
        this.errorHandler.handleErrorWithToster(err);
      }
    });
  }

  onPrint(): void {
    window.print();
  }
}
