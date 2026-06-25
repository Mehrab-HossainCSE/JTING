import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-restore-from-ta',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './restore-from-ta.html',
  styleUrl: './restore-from-ta.scss'
})
export class RestoreFromTa implements OnInit {
  // Selected filter values
  selectedSku = signal('');
  selectedBatch = signal('');
  selectedPicker = signal('');
  selectedBlock = signal('');
  selectedArch = signal('');
  selectedLine = signal('');

  isLoading = signal(false);

  // Dropdown Dummy Lists
  skuList = signal<{ skuCode: string; skuName: string }[]>([
    { skuCode: 'SKU-001', skuName: 'Sheikh Full Flavour 20s' },
    { skuCode: 'SKU-002', skuName: 'Gold Leaf Premium 20s' },
    { skuCode: 'SKU-003', skuName: 'Benson & Hedges Light 20s' },
  ]);

  batchList = signal<string[]>(['41744513', '41744514', '41744515']);
  pickerList = signal<string[]>(['foysal', 'mehrab', 'sohel', 'shakil']);

  blockList = signal<{ blockId: string; blockName: string }[]>([
    { blockId: 'B1', blockName: 'Block 1' },
    { blockId: 'B2', blockName: 'Block 2' },
  ]);

  archList = signal<{ archId: string; archName: string }[]>([
    { archId: 'A1', archName: 'Arch A' },
    { archId: 'A2', archName: 'Arch B' },
  ]);

  lineList = signal<{ lineId: string; lineName: string }[]>([
    { lineId: 'L1', lineName: 'Line 1' },
    { lineId: 'L2', lineName: 'Line 2' },
  ]);

  // Table lists with dummy data
  sourcePallets = signal<any[]>([
    {
      controlName: 'TA-01-B01',
      palletNo: '15109084110326000088412',
      skuCode: '15109084',
      skuName: 'Sheikh Full Flavour 20s',
      qty: 30,
      checked: false
    },
    {
      controlName: 'TA-01-B02',
      palletNo: '15109084110326000088413',
      skuCode: '15109085',
      skuName: 'Gold Leaf Premium 20s',
      qty: 45,
      checked: false
    },
    {
      controlName: 'TA-02-B01',
      palletNo: '15109084110326000088414',
      skuCode: '15109086',
      skuName: 'Benson & Hedges Light 20s',
      qty: 15,
      checked: false
    }
  ]);

  destLocations = signal<any[]>([
    { boxId: 'BOX-101', controlName: 'N1A14L05B01', checked: false },
    { boxId: 'BOX-102', controlName: 'N1A14L05B02', checked: false },
    { boxId: 'BOX-103', controlName: 'N1A14L05B03', checked: false },
    { boxId: 'BOX-104', controlName: 'N1A14L05B04', checked: false },
  ]);

  // Computed checkboxes states
  isSourceAllSelected = computed(() => {
    const list = this.sourcePallets();
    if (list.length === 0) return false;
    return list.every(item => item.checked);
  });

  isDestAllSelected = computed(() => {
    const list = this.destLocations();
    if (list.length === 0) return false;
    return list.every(item => item.checked);
  });

  ngOnInit(): void {}

  // Checkbox interactions
  toggleSourceAll(checked: boolean): void {
    this.sourcePallets.update(current => current.map(item => ({ ...item, checked })));
  }

  onPalletCheckChange(index: number, checked: boolean): void {
    this.sourcePallets.update(current => {
      const updated = [...current];
      if (updated[index]) {
        updated[index] = { ...updated[index], checked };
      }
      return updated;
    });
  }

  toggleDestAll(checked: boolean): void {
    this.destLocations.update(current => current.map(item => ({ ...item, checked })));
  }

  onLocationCheckChange(index: number, checked: boolean): void {
    this.destLocations.update(current => {
      const updated = [...current];
      if (updated[index]) {
        updated[index] = { ...updated[index], checked };
      }
      return updated;
    });
  }

  onConfirmRestore() {
    this.isLoading.set(true);
    setTimeout(() => {
      this.isLoading.set(false);
      console.log('Restore from TA logic triggered', {
        selectedSku: this.selectedSku(),
        selectedBatch: this.selectedBatch(),
        selectedPicker: this.selectedPicker(),
        selectedBlock: this.selectedBlock(),
        selectedArch: this.selectedArch(),
        selectedLine: this.selectedLine(),
        pallets: this.sourcePallets().filter(p => p.checked),
        locations: this.destLocations().filter(l => l.checked)
      });
      this.onReset();
    }, 1000);
  }

  onReset() {
    this.selectedSku.set('');
    this.selectedBatch.set('');
    this.selectedPicker.set('');
    this.selectedBlock.set('');
    this.selectedArch.set('');
    this.selectedLine.set('');
    
    this.sourcePallets.update(current => current.map(item => ({ ...item, checked: false })));
    this.destLocations.update(current => current.map(item => ({ ...item, checked: false })));
  }
}
