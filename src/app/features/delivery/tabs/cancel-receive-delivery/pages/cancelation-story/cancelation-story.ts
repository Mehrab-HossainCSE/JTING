import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

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
  fromDate = signal('2026-06-22');
  toDate = signal('2026-06-22');
  selectedType = signal('All');
  isLoading = signal(false);
  storyList = signal<CancelationStoryRecord[]>([]);

  types = signal<string[]>(['All', 'Receive', 'Delivery']);

  ngOnInit(): void {
    // Search history automatically on init
    this.onSearch();
  }

  onSearch() {
    this.isLoading.set(true);
    // Mock loading history data
    setTimeout(() => {
      const allRecords: CancelationStoryRecord[] = [
        {
          cancelId: 'CNL-2026-00018',
          cancelDate: '06/22/2026',
          txNo: 'GRN-2026-00124',
          type: 'Receive',
          reason: 'Incorrect SKU quantity input by operator',
          cancelledBy: 'foysal',
          qty: 100
        },
        {
          cancelId: 'CNL-2026-00019',
          cancelDate: '06/22/2026',
          txNo: 'DLV-2026-00109',
          type: 'Delivery',
          reason: 'Truck assignment changed',
          cancelledBy: 'admin',
          qty: 24
        },
        {
          cancelId: 'CNL-2026-00020',
          cancelDate: '06/22/2026',
          txNo: 'GRN-2026-00130',
          type: 'Receive',
          reason: 'Pallet allocation error on location B-01-A',
          cancelledBy: 'foysal',
          qty: 50
        }
      ];

      const filtered = allRecords.filter(item => {
        if (this.selectedType() === 'All') return true;
        return item.type === this.selectedType();
      });

      this.storyList.set(filtered);
      this.isLoading.set(false);
    }, 450);
  }

  onViewDetails(record: CancelationStoryRecord): void {
    Swal.fire({
      title: 'Cancellation Details',
      html: `
        <div style="text-align: left; font-size: 0.85rem; line-height: 1.6;">
          <p><strong>Cancel No:</strong> ${record.cancelId}</p>
          <p><strong>Date:</strong> ${record.cancelDate}</p>
          <p><strong>Type:</strong> ${record.type}</p>
          <p><strong>Reference No:</strong> ${record.txNo}</p>
          <p><strong>Quantity:</strong> ${record.qty}</p>
          <p><strong>Cancelled By:</strong> ${record.cancelledBy}</p>
          <p><strong>Remarks:</strong> ${record.reason}</p>
        </div>
      `,
      icon: 'info',
      confirmButtonText: 'Close',
      confirmButtonColor: '#00bb31'
    });
  }

  onReset() {
    this.fromDate.set('2026-06-22');
    this.toDate.set('2026-06-22');
    this.selectedType.set('All');
    this.storyList.set([]);
  }
}
