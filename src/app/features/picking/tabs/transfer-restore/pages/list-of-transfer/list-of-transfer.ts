import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface RelocationLog {
  relocationId: string;
  keeper: string;
  date: string;
  status: string;
}

export interface RelocationDetail {
  sourceBox: string;
  destBox: string;
  skuId: string;
  skuDescription: string;
  batch: string;
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
  selectedType = signal('All');
  selectedTransferId = signal('RT-260601');
  
  isLoading = signal(false);

  // Mock list of relocation summaries
  relocations = signal<RelocationLog[]>([
    { relocationId: 'RT-260601', keeper: 'foysal', date: '06/22/2026', status: 'Completed' },
    { relocationId: 'RT-260602', keeper: 'mehrab', date: '06/22/2026', status: 'Completed' },
    { relocationId: 'RT-260603', keeper: 'sohel', date: '06/22/2026', status: 'Pending' }
  ]);

  // Mock detail mappings keyed by relocationId
  detailsMap = signal<{ [key: string]: RelocationDetail[] }>({
    'RT-260601': [
      { sourceBox: 'N1A14L05B01', destBox: 'N1A14L05B03', skuId: '15109084', skuDescription: 'Sheikh Full Flavour 20s', batch: '41744513' },
      { sourceBox: 'N1A14L05B02', destBox: 'N1A14L05B04', skuId: '15109085', skuDescription: 'Gold Leaf Premium 20s', batch: '41744514' }
    ],
    'RT-260602': [
      { sourceBox: 'TA-01-B01', destBox: 'N1A15L02B01', skuId: '15109086', skuDescription: 'Benson & Hedges Light 20s', batch: '41744515' }
    ],
    'RT-260603': [
      { sourceBox: 'TA-02-B02', destBox: 'N1A15L02B02', skuId: '15109084', skuDescription: 'Sheikh Full Flavour 20s', batch: '41744513' }
    ]
  });

  // Computed details for the right-side grid
  activeDetails = computed(() => {
    const activeId = this.selectedTransferId();
    return this.detailsMap()[activeId] || [];
  });

  ngOnInit(): void {}

  onSearch(): void {
    this.isLoading.set(true);
    setTimeout(() => {
      this.isLoading.set(false);
    }, 600);
  }

  selectRelocation(relocationId: string): void {
    this.selectedTransferId.set(relocationId);
  }

  onPrint(): void {
    console.log('Printing Transfer Receipt for ID:', this.selectedTransferId());
    window.print();
  }
}
