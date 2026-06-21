import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface PickingMaster {
  pickingId: string;
  pickingDate: string;
  fullPallet: number;
}

export interface PickingDetail {
  batch: string;
  receiveDate: string;
  skuDescription: string;
  palletNo: string;
  location: string;
  qty: number;
  pickerName: string;
  pickDone: boolean;
}

@Component({
  selector: 'app-complete',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './complete.html',
  styleUrls: ['./complete.scss']
})
export class Complete {
  // Master Signals
  fromDate = signal(new Date().toISOString().split('T')[0]);
  toDate = signal(new Date().toISOString().split('T')[0]);
  isLoadingMaster = signal(false);
  masterList = signal<PickingMaster[]>([]);
  selectedPickingId = signal<string | null>(null);

  // Detail Signals
  isLoadingDetail = signal(false);
  detailsList = signal<PickingDetail[]>([]);

  onSearch() {
    this.isLoadingMaster.set(true);
    // Mocking master data load
    setTimeout(() => {
      this.masterList.set([
        { pickingId: 'PK-2026-001', pickingDate: '06/16/2026', fullPallet: 12 },
        { pickingId: 'PK-2026-002', pickingDate: '06/16/2026', fullPallet: 8 }
      ]);
      this.isLoadingMaster.set(false);
    }, 800);
  }

  onSelectPicking(id: string) {
    this.selectedPickingId.set(id);
    this.isLoadingDetail.set(true);
    // Mocking detail data load
    setTimeout(() => {
      this.detailsList.set([
        { 
          batch: 'B-001', 
          receiveDate: '06/10/2026', 
          skuDescription: 'Item Alpha Premium', 
          palletNo: 'PLT-55', 
          location: 'A-10-B', 
          qty: 24, 
          pickerName: 'Mr. ms', 
          pickDone: true 
        }
      ]);
      this.isLoadingDetail.set(false);
    }, 600);
  }

  onPrint() {
    console.log('Printing picking log for:', this.selectedPickingId());
  }
}
