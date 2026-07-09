import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { CancellationService } from '../../../../../../core/services/cancellationServices/cancellation.service';

export interface CancelationStoryRecord {
  cancelNo: string;
  createDate: string;
  remarks: string;
  createBy: string;
}

@Component({
  selector: 'app-cancelation-story',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cancelation-story.html',
  styleUrl: './cancelation-story.scss'
})
export class CancelationStory implements OnInit {
  private cancellationService = inject(CancellationService);

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
    this.cancellationService.getDatewiseCancelList(
      this.fromDate(),
      this.toDate(),
      this.selectedType()
    ).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          const list = Array.isArray(res.data) ? res.data : [];
          this.storyList.set(list.map((item: any) => ({
            cancelNo: item.cancelNo || '',
            createDate: item.createDate ? item.createDate.split('T')[0] : '',
            remarks: item.remarks || '',
            createBy: item.createBy || ''
          })));
        } else {
          this.storyList.set([]);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load cancellation story:', err);
        this.storyList.set([]);
        this.isLoading.set(false);
      }
    });
  }

  onPrint(record: CancelationStoryRecord): void {
    console.log('Printing cancellation story record:', record);
  }

  onReset() {
    const today = new Date().toISOString().split('T')[0];
    this.fromDate.set(today);
    this.toDate.set(today);
    this.selectedType.set('All');
    this.storyList.set([]);
  }
}
