import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface SummaryItem {
  batchId: string;
  skuCode: string;
  skuName: string;
  uom: string;
  qty: number;
  remarks: string;
}

export interface DataItem {
  barcode: string;
  skuCode: string;
  skuName: string;
  uom: string;
  qty: number;
  editQty: number;
}

@Component({
  selector: 'app-delivery-tab',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './delivery.html',
  styleUrl: './delivery.scss'
})
export class Delivery implements OnInit {
  // Left Panel Inputs
  forwarder = signal('');
  poNo = signal('');
  carrier = signal('');
  containerNo = signal('');
  bookingNo = signal('');
  contactNo = signal('');
  candf = signal('');
  lockNo = signal('');
  dcNo = signal('');

  // Middle Panel Inputs
  challanNo = signal('');
  salesOrder = signal('');
  truck = signal('');
  driver = signal('');
  destination = signal('');
  barcode = signal('');
  batchNo = signal('');
  
  // Tab Selection
  activeTab = signal('details'); // 'details' | 'barcode'

  // Counters
  scannedCount = signal(0);

  // Table Data Lists
  summaryList = signal<SummaryItem[]>([]);
  dataList = signal<DataItem[]>([]);

  isLoading = signal(false);

  ngOnInit(): void {
    this.loadMockData();
  }

  loadMockData(): void {
    // Populate some default mock items to showcase the layout design
    this.summaryList.set([
      {
        batchId: '41744516',
        skuCode: '15109093',
        skuName: 'K-2 Filter Kings 10s',
        uom: 'Pcs',
        qty: 120,
        remarks: 'Direct Dispatch'
      },
      {
        batchId: '41744517',
        skuCode: '15109094',
        skuName: 'K-2 Gold Kings 10s',
        uom: 'Pcs',
        qty: 80,
        remarks: 'Fragile handling'
      }
    ]);

    this.dataList.set([
      {
        barcode: '15109096100326000088256',
        skuCode: '15109093',
        skuName: 'K-2 Filter Kings 10s',
        uom: 'Pcs',
        qty: 60,
        editQty: 60
      },
      {
        barcode: '15109096100326000088265',
        skuCode: '15109094',
        skuName: 'K-2 Gold Kings 10s',
        uom: 'Pcs',
        qty: 40,
        editQty: 40
      }
    ]);

    // Set big red counter value based on sum of data items quantity
    this.updateScannedCount();
  }

  updateScannedCount(): void {
    const total = this.dataList().reduce((sum, item) => sum + item.qty, 0);
    this.scannedCount.set(total);
  }

  onSearch(): void {
    console.log('Searching with params:', {
      challanNo: this.challanNo(),
      salesOrder: this.salesOrder(),
      truck: this.truck(),
      driver: this.driver(),
      destination: this.destination(),
      barcode: this.barcode(),
      batchNo: this.batchNo(),
      activeTab: this.activeTab()
    });
  }

  onRePrint(): void {
    console.log('Re-printing DC No:', this.dcNo());
  }

  onPreview(): void {
    console.log('Previewing Delivery. Form data:', this.getFormData());
  }

  onSave(): void {
    console.log('Saving Delivery. Form data:', this.getFormData());
  }

  onClose(): void {
    console.log('Closing Delivery Tab.');
  }

  getFormData() {
    return {
      forwarder: this.forwarder(),
      poNo: this.poNo(),
      carrier: this.carrier(),
      containerNo: this.containerNo(),
      bookingNo: this.bookingNo(),
      contactNo: this.contactNo(),
      candf: this.candf(),
      lockNo: this.lockNo(),
      dcNo: this.dcNo(),
      challanNo: this.challanNo(),
      salesOrder: this.salesOrder(),
      truck: this.truck(),
      driver: this.driver(),
      destination: this.destination(),
      barcode: this.barcode(),
      batchNo: this.batchNo(),
      scannedCount: this.scannedCount()
    };
  }
}
