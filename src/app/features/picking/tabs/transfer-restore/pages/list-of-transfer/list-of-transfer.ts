import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { TransferRestoreService } from '../../../../../../core/services/pickingServices/transfer-restore.service';
import { LoaderService } from '../../../../../../core/services/loader.service';
import { ErrorHandlerService } from '../../../../../../core/services/error-handler.service';
import { RelocationDetail, RelocationLog } from '../../../../../../core/models/picking/transfer-restore';

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
  private router = inject(Router);

  fromDate = signal(new Date().toISOString().split('T')[0]);
  toDate = signal(new Date().toISOString().split('T')[0]);
  selectedType = signal('All');
  selectedTransferId = signal('');

  isLoading = signal(false);

  relocations = signal<RelocationLog[]>([]);
  activeDetails = signal<RelocationDetail[]>([]);

  ngOnInit(): void {
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
            relocationId: item.transferNo,
            keeper: item.pickerName,
            date: item.date,
            status: item.statusResult,
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
            sourceBox: d.sourceBoxLocation,
            destBox: d.destinationBoxLocation,
            skuId: d.skucode,
            skuDescription: d.skuname,
            batch: d.batchNo
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
    } else if (buttonName === 'Edit') {
      this.onEditItem(item.relocationId);
    } else if (buttonName === 'Delete') {
      this.confirmDelete(item.id);
    } else if (buttonName === 'Print') {
      this.onPrintItem(item.relocationId);
    } else {
      this.toastr.info(`Action "${buttonName}" clicked for Relocation: ${item.relocationId}`, 'Info');
    }
  }

  onEditItem(transferNo: string): void {
    const isRestore = transferNo.startsWith('RS');
    const targetRoute = isRestore
      ? '/picking/transfer-restore/restore-from-pa'
      : '/picking/transfer-restore/transfer';

    this.loaderService.show('Loading transfer data...');
    this.transferRestoreService.getTransferListWithBoxData(transferNo).subscribe({
      next: (res) => {
        this.loaderService.hide();
        if (res.success && res.data) {
          console.log("Hello I need this data: ", res.data);
          this.router.navigate([targetRoute], { state: { editData: res.data, transferNo } });
        }
      },
      error: (err) => {
        this.loaderService.hide();
        this.errorHandler.handleErrorWithToster(err);
      }
    });
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

  confirmDelete(id: number): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to delete this transfer/restore?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'No, cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.loaderService.show('Deleting transfer...');
        this.transferRestoreService.deleteTransferRestore(id).subscribe({
          next: (res) => {
            this.loaderService.hide();
            if (res.success) {
              this.toastr.success(res.message || 'Deleted successfully.', 'Success');
              this.onSearch(); // Refresh list
            } else {
              this.toastr.error(res.message || 'Failed to delete.', 'Error');
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
    if (buttonName === 'Done') {
      return 'bi-check-lg';
    }
    if (buttonName === 'Edit') {
      return 'bi-pencil-square';
    }
    if (buttonName === 'Delete') {
      return 'bi-trash';
    }
    if (buttonName === 'Print') {
      return 'bi-printer';
    }
    return 'bi-question-circle';
  }
}
