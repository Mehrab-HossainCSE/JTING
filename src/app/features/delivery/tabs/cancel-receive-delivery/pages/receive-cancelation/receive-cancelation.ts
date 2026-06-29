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

@Component({
  selector: 'app-receive-cancelation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './receive-cancelation.html',
  styleUrl: './receive-cancelation.scss'
})
export class ReceiveCancelation implements OnInit {
  // Select Dropdowns
  selectedSku = signal('');
  selectedBox = signal('');
  selectedPallet = signal('');
  selectedQty = signal('');
  cancellationDate = signal(new Date().toISOString().split('T')[0]);
  remarks = signal('');

  // Dropdown Lists
  skus = signal<{ code: string; name: string }[]>([
    { code: 'SKU-001', name: 'Item Alpha Premium' },
    { code: 'SKU-002', name: 'Item Beta Standard' },
    { code: 'SKU-003', name: 'Item Gamma Deluxe' }
  ]);
  boxes = signal<string[]>(['Box-A01', 'Box-B02', 'Box-C03', 'Box-D04']);
  pallets = signal<string[]>(['15109096100326000088256', '15109096100326000088265', '15109096100326000088274']);
  qtyOptions = signal<number[]>([10, 20, 50, 100, 150]);

  // Metadata labels
  skuDisplay = signal('0');
  batchDisplay = signal('0');
  palletDisplay = signal('0');
  recvDateDisplay = signal('0');
  shiftDisplay = signal('0');

  // Left List (Sequence list)
  sequenceList = signal<SequenceRecord[]>([]);
  allSelectChecked = signal(false);

  // Right List (Cancellation list)
  cancelItems = signal<CancelItem[]>([]);

  // Totals
  totalCase = signal(0);
  totalQty = signal(0);

  isLoading = signal(false);

  ngOnInit(): void {
    // Set initial date
    this.cancellationDate.set(new Date().toISOString().split('T')[0]);
  }

  // Trigger when Sku, Box, or Pallet changes
  onDropdownChange(): void {
    if (this.selectedSku() && this.selectedBox() && this.selectedPallet()) {
      const skuObj = this.skus().find(s => s.code === this.selectedSku());
      
      // Update metadata displays
      this.skuDisplay.set(this.selectedSku());
      this.batchDisplay.set('41744516');
      this.palletDisplay.set(this.selectedPallet());
      this.recvDateDisplay.set('06/22/2026');
      this.shiftDisplay.set('Day Shift');

      // Generate sequence list
      this.sequenceList.set([
        { seqNo: 'SEQ-100201', isChecked: false },
        { seqNo: 'SEQ-100202', isChecked: false },
        { seqNo: 'SEQ-100203', isChecked: false },
        { seqNo: 'SEQ-100204', isChecked: false }
      ]);
      this.allSelectChecked.set(false);
    } else {
      this.resetMetadata();
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

    const defaultQty = Number(this.selectedQty()) || 30; // default to 30 or selected qty

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

    // Remove added items from left list
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
    this.selectedSku.set('');
    this.selectedBox.set('');
    this.selectedPallet.set('');
    this.selectedQty.set('');
    this.remarks.set('');
    this.cancelItems.set([]);
    this.sequenceList.set([]);
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
    console.log('Saving Cancellation details:', {
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
