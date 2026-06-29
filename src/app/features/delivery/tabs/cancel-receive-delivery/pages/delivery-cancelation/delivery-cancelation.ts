import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface SequenceRecord {
  seqNo: string;
  isChecked: boolean;
}

export interface CancelItem {
  skuName: string;
  seqNo: string;
  qty: number;
}

export interface SkuWithoutPicking {
  skuName: string;
  batchNo: string;
  palletNo: string;
  date: string;
  location: string;
}

@Component({
  selector: 'app-delivery-cancelation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './delivery-cancelation.html',
  styleUrl: './delivery-cancelation.scss'
})
export class DeliveryCancelation implements OnInit {
  // Select Dropdowns & Inputs
  selectedChallan = signal('');
  selectedSku = signal('');
  selectedQty = signal('');
  cancellationDate = signal(new Date().toISOString().split('T')[0]);
  remarks = signal('');

  // Dropdown Lists
  challans = signal<string[]>(['CH-2026001', 'CH-2026002', 'CH-2026003']);
  skus = signal<{ code: string; name: string }[]>([
    { code: 'SKU-001', name: 'Item Alpha Premium' },
    { code: 'SKU-002', name: 'Item Beta Standard' },
    { code: 'SKU-003', name: 'Item Gamma Deluxe' }
  ]);
  qtyOptions = signal<number[]>([10, 20, 50, 100, 200]);

  // Detail display readouts
  truckNoDisplay = signal('0');
  driverNameDisplay = signal('0');
  destinationDisplay = signal('0');

  // Left List (Sequence checklist)
  sequenceList = signal<SequenceRecord[]>([]);
  allSelectChecked = signal(false);

  // Right Top List (Cancellation list)
  cancelItems = signal<CancelItem[]>([]);

  // Right Bottom List (SKU Without Picking)
  skuWithoutPickingList = signal<SkuWithoutPicking[]>([]);

  // Totals
  totalCase = signal(0);
  totalQty = signal(0);

  isLoading = signal(false);

  ngOnInit(): void {
    // Set initial date
    this.cancellationDate.set(new Date().toISOString().split('T')[0]);
  }

  // Triggered when Challan or SKU changes
  onChallanOrSkuChange(): void {
    if (this.selectedChallan() && this.selectedSku()) {
      const skuObj = this.skus().find(s => s.code === this.selectedSku());

      // Update detail display readouts
      this.truckNoDisplay.set('TRK-2041');
      this.driverNameDisplay.set('John Smith');
      this.destinationDisplay.set('Dhaka Warehouse Central');

      // Generate sequence list
      this.sequenceList.set([
        { seqNo: 'SEQ-2026401', isChecked: false },
        { seqNo: 'SEQ-2026402', isChecked: false },
        { seqNo: 'SEQ-2026403', isChecked: false },
        { seqNo: 'SEQ-2026404', isChecked: false }
      ]);
      this.allSelectChecked.set(false);

      // Generate SKU Without Picking mock items
      if (skuObj) {
        this.skuWithoutPickingList.set([
          {
            skuName: skuObj.name,
            batchNo: 'B-4412',
            palletNo: 'PLT-987',
            date: '06/22/2026',
            location: 'A-01-A'
          }
        ]);
      }
    } else {
      this.resetDetails();
    }
  }

  toggleAllSelect(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.allSelectChecked.set(checked);
    this.sequenceList.update(list => list.map(item => ({ ...item, isChecked: checked })));
  }

  onAdd(): void {
    const skuObj = this.skus().find(s => s.code === this.selectedSku());
    if (!skuObj) return;

    const checkedItems = this.sequenceList().filter(item => item.isChecked);
    if (checkedItems.length === 0) return;

    const defaultQty = Number(this.selectedQty()) || 24; // default to 24 or selected qty

    const newCancelItems: CancelItem[] = checkedItems.map(item => ({
      skuName: skuObj.name,
      seqNo: item.seqNo,
      qty: defaultQty
    }));

    // Add to right list, preventing duplicates
    this.cancelItems.update(list => {
      const filtered = list.filter(l => !newCancelItems.some(n => n.seqNo === l.seqNo));
      return [...filtered, ...newCancelItems];
    });

    // Remove added items from left sequence list
    this.sequenceList.update(list => list.filter(item => !item.isChecked));
    this.allSelectChecked.set(false);

    // Update Totals
    this.updateTotals();
  }

  onRemoveItem(seqNo: string): void {
    const itemToRemove = this.cancelItems().find(item => item.seqNo === seqNo);
    if (!itemToRemove) return;

    // Remove from right list
    this.cancelItems.update(list => list.filter(item => item.seqNo !== seqNo));

    // Return to left list
    this.sequenceList.update(list => [...list, { seqNo: itemToRemove.seqNo, isChecked: false }]);

    // Update Totals
    this.updateTotals();
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
    this.resetDetails();
    this.updateTotals();
  }

  resetDetails(): void {
    this.truckNoDisplay.set('0');
    this.driverNameDisplay.set('0');
    this.destinationDisplay.set('0');
  }

  onSave(): void {
    console.log('Saving Delivery Cancellation details:', {
      challanNo: this.selectedChallan(),
      cancellationDate: this.cancellationDate(),
      remarks: this.remarks(),
      totalCase: this.totalCase(),
      totalQty: this.totalQty(),
      items: this.cancelItems()
    });
  }

  onPrint(): void {
    window.print();
  }
}
