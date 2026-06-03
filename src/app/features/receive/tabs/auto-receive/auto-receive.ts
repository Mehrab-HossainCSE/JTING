import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface SummaryItem {
  skuCode: string;
  skuName: string;
  qty: number;
}

interface BatchItem {
  batchNo: string;
  skuName: string;
  location: string;
  palletNo: string;
}

@Component({
  selector: 'app-auto-receive',
  imports: [CommonModule, FormsModule],
  templateUrl: './auto-receive.html',
  styleUrl: './auto-receive.scss',
})
export class AutoReceive {
  barcodeInput: string = '';
  notes: string = '';

  totalCartons: number = 0;
  scannedEntries: number = 0;

  summaryItems: SummaryItem[] = [];
  batchItems: BatchItem[] = [];

  onBarcodeEnter(): void {
    const code = this.barcodeInput.trim();
    if (!code) return;

    const existing = this.summaryItems.find(item => item.skuCode === code);
    if (existing) {
      existing.qty += 1;
    } else {
      this.summaryItems.push({
        skuCode: code,
        skuName: `SKU - ${code}`,
        qty: 1,
      });
    }

    this.totalCartons += 1;
    this.scannedEntries = this.summaryItems.length;
    this.barcodeInput = '';
  }

  onConfirm(): void {
    const code = this.barcodeInput.trim();
    if (code) {
      this.onBarcodeEnter();
    }
  }

  onClear(): void {
    this.barcodeInput = '';
    this.notes = '';
    this.summaryItems = [];
    this.batchItems = [];
    this.totalCartons = 0;
    this.scannedEntries = 0;
  }
}