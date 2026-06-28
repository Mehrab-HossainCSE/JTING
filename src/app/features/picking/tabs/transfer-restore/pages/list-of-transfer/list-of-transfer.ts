import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { TransferRestoreService } from '../../../../../../core/services/pickingServices/transfer-restore.service';
import { LoaderService } from '../../../../../../core/services/loader.service';
import { ErrorHandlerService } from '../../../../../../core/services/error-handler.service';

export interface RelocationLog {
  id: number;
  relocationId: string;
  keeper: string;
  date: string;
  status: string;
  button1?: string;
  button2?: string;
  button3?: string;
  button4?: string;
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
  private transferRestoreService = inject(TransferRestoreService);
  private loaderService = inject(LoaderService);
  private errorHandler = inject(ErrorHandlerService);
  private toastr = inject(ToastrService);

  fromDate = signal(new Date().toISOString().split('T')[0]);
  toDate = signal(new Date().toISOString().split('T')[0]);
  selectedType = signal('All');
  selectedTransferId = signal('');
  
  isLoading = signal(false);

  // List of relocation summaries
  relocations = signal<RelocationLog[]>([]);

  // Selected relocation details
  activeDetails = signal<RelocationDetail[]>([]);

  ngOnInit(): void {
    // Initial search on load
    this.onSearch();
  }

  onSearch(): void {
    const from = this.fromDate();
    const to = this.toDate();
    const typeValue = this.selectedType() === 'All' ? 'All' : this.selectedType();

    this.isLoading.set(true);
    this.loaderService.show('Searching transfers...');

    this.transferRestoreService.getProgressList(from, to, typeValue).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.loaderService.hide();
        if (res.success && res.data) {
          const mapped = res.data.map((item: any) => ({
            id: item.id,
            relocationId: item.transferNo || item.restoreNo || item.relocationId || '--',
            keeper: item.pickerName || item.keeper || '--',
            date: item.date || item.createDate || '--',
            status: item.statusResult || item.status || '--',
            button1: item.button1,
            button2: item.button2,
            button3: item.button3,
            button4: item.button4
          }));
          this.relocations.set(mapped);
          this.selectedTransferId.set('');
          this.activeDetails.set([]);
        } else {
          this.relocations.set([]);
          this.selectedTransferId.set('');
          this.activeDetails.set([]);
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        this.loaderService.hide();
        this.errorHandler.handleErrorWithToster(err);
      }
    });
  }

  selectRelocation(relocationId: string): void {
    if (!relocationId) return;
    this.selectedTransferId.set(relocationId);
    
    this.loaderService.show('Loading transfer details...');
    this.transferRestoreService.getDetails(relocationId).subscribe({
      next: (res) => {
        this.loaderService.hide();
        if (res.success && res.data) {
          const mapped = res.data.map((d: any) => ({
            sourceBox: d.sourceBox || d.sourceBoxLocation || d.controlName || '--',
            destBox: d.destBox || d.destinationBox || d.boxName || d.toBoxId || '--',
            skuId: d.skuId || d.skuCode || d.skucode || '--',
            skuDescription: d.skuDescription || d.skuName || d.skuname || '--',
            batch: d.batch || d.batchNo || '--'
          }));
          this.activeDetails.set(mapped);
        } else {
          this.activeDetails.set([]);
        }
      },
      error: (err) => {
        this.loaderService.hide();
        this.errorHandler.handleErrorWithToster(err);
      }
    });
  }

  onActionButtonClick(buttonName: string, item: RelocationLog): void {
    if (buttonName === 'Done') {
      this.confirmComplete(item.id);
    } else if (buttonName === 'Print') {
      this.onPrintItem(item.relocationId);
    } else {
      this.toastr.info(`Action "${buttonName}" clicked for Relocation: ${item.relocationId}`, 'Info');
    }
  }

  confirmComplete(id: number): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to mark this transfer/restore as completed?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#52b788',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, complete it',
      cancelButtonText: 'No, cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.loaderService.show('Completing transfer...');
        this.transferRestoreService.complete(id).subscribe({
          next: (res) => {
            this.loaderService.hide();
            if (res.success) {
              this.toastr.success(res.message || 'Completed successfully.', 'Success');
              this.onSearch(); // Refresh list
            } else {
              this.toastr.error(res.message || 'Failed to complete.', 'Error');
            }
          },
          error: (err) => {
            this.loaderService.hide();
            this.errorHandler.handleErrorWithToster(err);
          }
        });
      }
    });
  }

  onPrintItem(relocationId: string): void {
    this.selectedTransferId.set(relocationId);
    // Give a micro-delay for data binding before triggering print
    setTimeout(() => {
      window.print();
    }, 150);
  }

  onPrint(): void {
    if (this.selectedTransferId()) {
      window.print();
    }
  }

  getButtonIcon(buttonName: string): string {
    if (!buttonName) return '';
    const name = buttonName.toLowerCase();
    if (name.includes('done') || name.includes('complete')) {
      return 'bi-check-lg';
    }
    if (name.includes('edit') || name.includes('update')) {
      return 'bi-pencil-square';
    }
    if (name.includes('delete') || name.includes('remove') || name.includes('trash')) {
      return 'bi-trash';
    }
    if (name.includes('print')) {
      return 'bi-printer';
    }
    return 'bi-question-circle';
  }
}
