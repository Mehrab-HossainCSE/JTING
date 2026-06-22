import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface DeliveryItem {
  deliveryId: string;
  skuCode: string;
  skuDescription: string;
  batchNo: string;
  palletNo: string;
  location: string;
  qty: number;
  isSelected: boolean;
}

@Component({
  selector: 'app-delivery-tab',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './delivery.html',
  styleUrl: './delivery.scss'
})
export class Delivery implements OnInit {
  deliveryDate = signal(new Date().toISOString().split('T')[0]);
  selectedTruck = signal('');
  selectedDriver = signal('');
  selectedShift = signal('');
  isLoading = signal(false);
  deliveryList = signal<DeliveryItem[]>([]);

  trucks = signal<string[]>(['TRK-1002', 'TRK-2041', 'TRK-4412']);
  drivers = signal<string[]>(['Alex Rodriguez', 'John Smith', 'Michael Jordan']);
  shifts = signal<string[]>(['Day Shift', 'Night Shift']);

  ngOnInit(): void {
    this.onSearch();
  }

  onSearch() {
    this.isLoading.set(true);
    // Mock loading delivery items
    setTimeout(() => {
      this.deliveryList.set([
        {
          deliveryId: 'DL-2026-101',
          skuCode: 'SKU-001',
          skuDescription: 'Item Alpha Premium',
          batchNo: 'B-1002',
          palletNo: 'PLT-551',
          location: 'A-01-A',
          qty: 24,
          isSelected: false
        },
        {
          deliveryId: 'DL-2026-102',
          skuCode: 'SKU-002',
          skuDescription: 'Item Beta Standard',
          batchNo: 'B-2041',
          palletNo: 'PLT-612',
          location: 'C-04-B',
          qty: 12,
          isSelected: false
        },
        {
          deliveryId: 'DL-2026-103',
          skuCode: 'SKU-003',
          skuDescription: 'Item Gamma Deluxe',
          batchNo: 'B-4412',
          palletNo: 'PLT-987',
          location: 'D-02-C',
          qty: 48,
          isSelected: false
        }
      ]);
      this.isLoading.set(false);
    }, 600);
  }

  onDispatchSelected() {
    const selected = this.deliveryList().filter(item => item.isSelected);
    console.log('Dispatching items:', selected, {
      truck: this.selectedTruck(),
      driver: this.selectedDriver(),
      date: this.deliveryDate(),
      shift: this.selectedShift()
    });
  }

  toggleAll(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    this.deliveryList.update(list => list.map(item => ({ ...item, isSelected: checked })));
  }

  onReset() {
    this.deliveryDate.set(new Date().toISOString().split('T')[0]);
    this.selectedTruck.set('');
    this.selectedDriver.set('');
    this.selectedShift.set('');
    this.deliveryList.set([]);
  }
}
