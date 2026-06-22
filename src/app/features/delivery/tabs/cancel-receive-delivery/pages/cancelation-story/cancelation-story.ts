import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface CancelationStoryRecord {
  cancelId: string;
  cancelDate: string;
  txNo: string;
  type: 'Receive' | 'Delivery';
  reason: string;
  cancelledBy: string;
  qty: number;
}

@Component({
  selector: 'app-cancelation-story',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cancelation-story.html',
  styleUrl: './cancelation-story.scss'
})
export class CancelationStory implements OnInit {
  fromDate = signal(new Date().toISOString().split('T')[0]);
  toDate = signal(new Date().toISOString().split('T')[0]);
  selectedType = signal('All');
  isLoading = signal(false);
  storyList = signal<CancelationStoryRecord[]>([]);

  types = signal<string[]>(['All', 'Receive', 'Delivery']);

  ngOnInit(): void {
    this.onSearch();
  }

  onSearch() {
    this.isLoading.set(true);
    // Mock loading data
    setTimeout(() => {
      const allRecords: CancelationStoryRecord[] = [
        {
          cancelId: 'CNL-2026-801',
          cancelDate: '06/22/2026',
          txNo: 'GRN-2026-001',
          type: 'Receive',
          reason: 'Incorrect SKU quantity input by operator',
          cancelledBy: 'Admin ms',
          qty: 100
        },
        {
          cancelId: 'CNL-2026-802',
          cancelDate: '06/22/2026',
          txNo: 'DLV-2026-001',
          type: 'Delivery',
          reason: 'Truck routing changes',
          cancelledBy: 'Supervisor John',
          qty: 24
        }
      ];

      const filtered = allRecords.filter(item => {
        if (this.selectedType() === 'All') return true;
        return item.type === this.selectedType();
      });

      this.storyList.set(filtered);
      this.isLoading.set(false);
    }, 600);
  }

  onReset() {
    this.fromDate.set(new Date().toISOString().split('T')[0]);
    this.toDate.set(new Date().toISOString().split('T')[0]);
    this.selectedType.set('All');
    this.storyList.set([]);
  }
}
