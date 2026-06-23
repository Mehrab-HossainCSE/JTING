import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ReconciliationService } from '../../../../../../core/services/receiveServices/reconciliation-service';

@Component({
  selector: 'app-rec-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './rec-history.html',
  styleUrls: ['../../reconciliation.scss']
})
export class RecHistory implements OnInit {
  private toastr = inject(ToastrService);
  private reconciliationService = inject(ReconciliationService);

  permissions = signal({ canView: true, canCreate: true, canUpdate: true, canDelete: true });
  canCreate = computed(() => this.permissions().canCreate);
  
  reconciliationType = signal('0');
  fromDate = signal('');
  toDate = signal('');
  results = signal<any[]>([]);
  isLoading = signal(false);

  ngOnInit(): void {
    this.initDates();
  }

  private initDates(): void {
    const today = this.getCurrentDateString();
    this.fromDate.set(today);
    this.toDate.set(today);
  }

  private getCurrentDateString(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  searchHistory(): void {
    this.isLoading.set(true);

    const fromDateISO = this.fromDate() ? new Date(this.fromDate()).toISOString() : new Date().toISOString();
    const toDateISO = this.toDate() ? new Date(this.toDate()).toISOString() : new Date().toISOString();

    const payload = {
      fromDate: fromDateISO,
      toDate: toDateISO,
      reconciliationType: Number(this.reconciliationType())
    };

    this.reconciliationService.search(payload).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res.success && res.data) {
          this.results.set(res.data);
          this.toastr.success(res.message || 'Records retrieved successfully.', 'Success');
        } else {
          this.results.set([]);
          this.toastr.error(res.message || 'Failed to search records.', 'Error');
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        this.results.set([]);
        this.toastr.error(err?.message || 'Error searching reconciliation history.', 'Error');
      }
    });
  }

  clearData(): void {
    this.reconciliationType.set('0');
    this.initDates();
    this.results.set([]);
  }

  private printBlob(pdfBlob: Blob): void {
    const fileURL = window.URL.createObjectURL(pdfBlob);

    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.left = '-9999px';
    iframe.style.top = '-9999px';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';

    iframe.onload = () => {
      if (iframe.contentWindow) {
        iframe.contentWindow.onafterprint = () => {
          document.body.removeChild(iframe);
          window.URL.revokeObjectURL(fileURL);
        };
      }
      setTimeout(() => {
        if (iframe.contentWindow) {
          iframe.contentWindow.focus();
          iframe.contentWindow.print();
        }
      }, 500);
    };

    iframe.src = fileURL;
    document.body.appendChild(iframe);
  }

  printRecord(recNo: string): void {
    if (!recNo) {
      this.toastr.warning('Invalid Reconciliation Number.', 'Warning');
      return;
    }

    this.isLoading.set(true);
    this.toastr.info('Printing reconciliation results...', 'Print');

    this.reconciliationService.printReconciliation(recNo).subscribe({
      next: (pdfBlob) => {
        this.isLoading.set(false);
        this.printBlob(pdfBlob);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.toastr.error(err?.message || 'Error downloading print report.', 'Error');
      }
    });
  }
}
