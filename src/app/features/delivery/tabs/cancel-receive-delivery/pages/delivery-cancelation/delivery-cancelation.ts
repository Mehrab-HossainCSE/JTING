import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface DeliveryCancelRecord {
  deliveryId: string;
  skuCode: string;
  skuDescription: string;
  batchNo: string;
  palletNo: string;
  qty: number;
  date: string;
  truckNo: string;
  driverName: string;
  status: 'Completed' | 'Cancelled';
}

@Component({
  selector: 'app-delivery-cancelation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './delivery-cancelation.html',
  styleUrl: './delivery-cancelation.scss'
})
export class DeliveryCancelation implements OnInit {
  fromDate = signal(new Date().toISOString().split('T')[0]);
  toDate = signal(new Date().toISOString().split('T')[0]);
  truckNo = signal('');
  isLoading = signal(false);
  deliveryList = signal<DeliveryCancelRecord[]>([]);

  trucks = signal<string[]>(['TRK-1002', 'TRK-2041', 'TRK-4412']);

  ngOnInit(): void {
    this.onSearch();
  }

  onSearch() {
    this.isLoading.set(true);
    // Mock loading data
    setTimeout(() => {
      this.deliveryList.set([
        {
          deliveryId: 'DLV-2026-001',
          skuCode: 'SKU-001',
          skuDescription: 'Item Alpha Premium',
          batchNo: 'B-1002',
          palletNo: 'PLT-551',
          qty: 24,
          date: '06/22/2026',
          truckNo: 'TRK-1002',
          driverName: 'Alex Rodriguez',
          status: 'Completed'
        },
        {
          deliveryId: 'DLV-2026-002',
          skuCode: 'SKU-002',
          skuDescription: 'Item Beta Standard',
          batchNo: 'B-2041',
          palletNo: 'PLT-612',
          qty: 12,
          date: '06/22/2026',
          truckNo: 'TRK-2041',
          driverName: 'John Smith',
          status: 'Completed'
        }
      ]);
      this.isLoading.set(false);
    }, 600);
  }

  onCancelDelivery(record: DeliveryCancelRecord) {
    console.log('Cancelling Delivery dispatch:', record);
    this.deliveryList.update(list =>
      list.map(item =>
        item.deliveryId === record.deliveryId ? { ...item, status: 'Cancelled' } : item
      )
    );
  }

  onReset() {
    this.fromDate.set(new Date().toISOString().split('T')[0]);
    this.toDate.set(new Date().toISOString().split('T')[0]);
    this.truckNo.set('');
    this.deliveryList.set([]);
  }
}
