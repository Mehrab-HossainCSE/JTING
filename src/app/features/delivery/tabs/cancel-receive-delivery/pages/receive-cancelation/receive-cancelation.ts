import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface ReceiveRecord {
  grnNo: string;
  skuCode: string;
  skuDescription: string;
  batchNo: string;
  palletNo: string;
  location: string;
  qty: number;
  date: string;
  status: 'Completed' | 'Cancelled';
}

@Component({
  selector: 'app-receive-cancelation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './receive-cancelation.html',
  styleUrl: './receive-cancelation.scss'
})
export class ReceiveCancelation implements OnInit {
  fromDate = signal(new Date().toISOString().split('T')[0]);
  toDate = signal(new Date().toISOString().split('T')[0]);
  skuCode = signal('');
  isLoading = signal(false);
  receiveList = signal<ReceiveRecord[]>([]);

  skus = signal<{ code: string; name: string }[]>([
    { code: 'SKU-001', name: 'Item Alpha Premium' },
    { code: 'SKU-002', name: 'Item Beta Standard' },
    { code: 'SKU-003', name: 'Item Gamma Deluxe' }
  ]);

  ngOnInit(): void {
    this.onSearch();
  }

  onSearch() {
    this.isLoading.set(true);
    // Mock loading data
    setTimeout(() => {
      this.receiveList.set([
        {
          grnNo: 'GRN-2026-001',
          skuCode: 'SKU-001',
          skuDescription: 'Item Alpha Premium',
          batchNo: 'B-1001',
          palletNo: 'PLT-101',
          location: 'A-01-A',
          qty: 100,
          date: '06/22/2026',
          status: 'Completed'
        },
        {
          grnNo: 'GRN-2026-002',
          skuCode: 'SKU-002',
          skuDescription: 'Item Beta Standard',
          batchNo: 'B-2002',
          palletNo: 'PLT-102',
          location: 'C-04-B',
          qty: 50,
          date: '06/22/2026',
          status: 'Completed'
        }
      ]);
      this.isLoading.set(false);
    }, 600);
  }

  onCancelGRN(record: ReceiveRecord) {
    console.log('Cancelling Receive GRN:', record);
    this.receiveList.update(list =>
      list.map(item =>
        item.grnNo === record.grnNo ? { ...item, status: 'Cancelled' } : item
      )
    );
  }

  onReset() {
    this.fromDate.set(new Date().toISOString().split('T')[0]);
    this.toDate.set(new Date().toISOString().split('T')[0]);
    this.skuCode.set('');
    this.receiveList.set([]);
  }
}
