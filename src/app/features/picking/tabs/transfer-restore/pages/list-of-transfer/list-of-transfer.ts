import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface TransferRecord {
  transferId: string;
  transferDate: string;
  skuCode: string;
  skuDescription: string;
  palletNo: string;
  fromLocation: string;
  toLocation: string;
  qty: number;
  status: string;
}

@Component({
  selector: 'app-list-of-transfer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './list-of-transfer.html',
  styleUrl: './list-of-transfer.scss'
})
export class ListOfTransfer implements OnInit {
  fromDate = signal(new Date().toISOString().split('T')[0]);
  toDate = signal(new Date().toISOString().split('T')[0]);
  isLoading = signal(false);
  transferList = signal<TransferRecord[]>([]);

  ngOnInit(): void {
    this.onSearch();
  }

  onSearch() {
    this.isLoading.set(true);
    // Mock loading data
    setTimeout(() => {
      this.transferList.set([
        {
          transferId: 'TR-2026-001',
          transferDate: '06/22/2026',
          skuCode: 'SKU-001',
          skuDescription: 'Item Alpha Premium',
          palletNo: 'PLT-1002',
          fromLocation: 'A-01-A',
          toLocation: 'B-12-D',
          qty: 50,
          status: 'Completed'
        },
        {
          transferId: 'TR-2026-002',
          transferDate: '06/22/2026',
          skuCode: 'SKU-002',
          skuDescription: 'Item Beta Standard',
          palletNo: 'PLT-2041',
          fromLocation: 'C-04-B',
          toLocation: 'D-02-C',
          qty: 24,
          status: 'Completed'
        }
      ]);
      this.isLoading.set(false);
    }, 600);
  }
}
