import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface CaseItem {
  skuName: string;
  sequenceNo: string;
  selected: boolean;
}

interface PalletDetail {
  palletNo: string;
  arch: string;
  line: string;
  box: string;
  total: string | number;
}

@Component({
  selector: 'app-split-pallet',
  imports: [CommonModule, FormsModule],
  templateUrl: './split-pallet.html',
  styleUrl: './split-pallet.scss',
})
export class SplitPallet {

  form = {
    block: 'FG1',
    arch: 'FG-1-ARCH',
    line: 'L3',
    box: 'FG1A01L031',
    pa: false,
    sku: '',
    palletNo: '',
  };

  remarks: string = '';
  selectedCount: number = 0;
  caseItems: CaseItem[] = [];

  oldPallet: PalletDetail = { palletNo: '', arch: '', line: '', box: '', total: '' };
  newPallet: PalletDetail = { palletNo: '', arch: '', line: '', box: '', total: '' };

  onFormChange(): void {
    // Reset case list on form field change
    this.caseItems = [];
    this.selectedCount = 0;
  }

  onPalletChange(): void {
    this.onFormChange();
  }

  onSubmit(): void {
    if (!this.form.sku || !this.form.palletNo) return;

    // Simulate loading cases based on selected pallet
    this.caseItems = Array.from({ length: 8 }, (_, i) => ({
      skuName: 'Navy Special Filter 10s',
      sequenceNo: String(101791 + i),
      selected: false,
    }));

    this.oldPallet = {
      palletNo: this.form.palletNo,
      arch: this.form.arch,
      line: this.form.line,
      box: this.form.box,
      total: this.caseItems.length,
    };

    this.newPallet = { palletNo: '', arch: '', line: '', box: '', total: '' };
    this.selectedCount = 0;
  }

  onCheckboxChange(): void {
    this.selectedCount = this.caseItems.filter(i => i.selected).length;

    // Update new pallet total based on selection
    this.newPallet = {
      palletNo: this.selectedCount > 0 ? 'NEW-PLT-001' : '',
      arch: this.selectedCount > 0 ? this.form.arch : '',
      line: this.selectedCount > 0 ? this.form.line : '',
      box: this.selectedCount > 0 ? this.form.box : '',
      total: this.selectedCount > 0 ? this.selectedCount : '',
    };

    // Update old pallet total
    if (this.caseItems.length > 0) {
      this.oldPallet.total = this.caseItems.length - this.selectedCount;
    }
  }

  onSplitNow(): void {
    if (this.selectedCount === 0) return;
    // Split action — hook up to your service here
    alert(`Split completed: ${this.selectedCount} case(s) moved to new pallet.`);
  }
}