import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { PickingService } from '../../../../../../core/services/pickingServices/picking-service';
import { ReconciliationService } from '../../../../../../core/services/receiveServices/reconciliation-service';
import { ToastrService } from 'ngx-toastr';
import { ErrorHandlerService } from '../../../../../../core/services/error-handler.service';
import { PickingItem } from '../../../../../../core/models/picking/picking';
import Swal, { SweetAlertResult } from 'sweetalert2';

@Component({
  selector: 'app-inprogress',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inprogress.html',
  styleUrl: './inprogress.scss'
})
export class Inprogress implements OnInit {
  private pickingService = inject(PickingService);
  private reconciliationService = inject(ReconciliationService);
  private toastr = inject(ToastrService);
  private errorHandler = inject(ErrorHandlerService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isLoading = signal(false);
  results = signal<PickingItem[]>([]);

  // Compute grouped picking items reactively based on pickingNo
  groupedResults = computed(() => {
    const raw = this.results();
    const groupsMap = new Map<string, PickingItem[]>();

    for (const item of raw) {
      const pNo = item.pickingNo || 'N/A';
      if (!groupsMap.has(pNo)) {
        groupsMap.set(pNo, []);
      }
      groupsMap.get(pNo)!.push(item);
    }

    return Array.from(groupsMap.entries()).map(([pickingNo, items]) => {
      const totalQty = items.reduce((sum, item) => sum + (item.qty || 0), 0);
      const date = items[0]?.createDate || '---';
      return {
        pickingNo,
        items,
        totalQty,
        date
      };
    });
  });

  ngOnInit(): void {
    this.loadTempProgress();
  }

  loadTempProgress(): void {
    this.isLoading.set(true);
    this.pickingService.getTempProgress('').subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res.success && res.data) {
          this.results.set(res.data);
        } else {
          this.results.set([]);
          if (!res.success) {
            this.toastr.error(res.message || 'Failed to load in-progress items.', 'Error');
          }
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        this.results.set([]);
        this.errorHandler.handleErrorWithToster(err);
      }
    });
  }

  onDoneGroup(group: any): void {
    if (!group.pickingNo) return;
    Swal.fire({
      title: 'Complete Picking?',
      text: `Are you sure you want to complete Picking No: "${group.pickingNo}"?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#00BB31',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, Complete it!',
      cancelButtonText: 'Cancel'
    }).then((result: SweetAlertResult) => {
      if (result.isConfirmed) {
        this.isLoading.set(true);
        this.pickingService.complete({ pickingNo: group.pickingNo }).subscribe({
          next: (res) => {
            this.isLoading.set(false);
            if (res.success) {
              this.toastr.success(res.message || 'Picking completed successfully.', 'Success');
              this.loadTempProgress();
            } else {
              this.toastr.error(res.message || 'Failed to complete picking.', 'Error');
            }
          },
          error: (err) => {
            this.isLoading.set(false);
            this.errorHandler.handleErrorWithToster(err);
          }
        });
      }
    });
  }

  onEditGroup(group: any): void {
    if (!group.pickingNo) return;
    this.router.navigate(['../start-picking'], {
      relativeTo: this.route,
      queryParams: { pickingNo: group.pickingNo }
    });
  }

  private printBlob(pdfBlob: Blob): void {
    const fileURL = window.URL.createObjectURL(pdfBlob);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Print Picking Slip</title>
            <style>
              body, html { margin: 0; padding: 0; height: 100%; overflow: hidden; }
              iframe { width: 100%; height: 100%; border: none; }
            </style>
          </head>
          <body>
            <iframe id="pdfFrame" src="${fileURL}"></iframe>
            <script>
              const iframe = document.getElementById('pdfFrame');
              iframe.onload = function() {
                setTimeout(function() {
                  iframe.contentWindow.focus();
                  iframe.contentWindow.print();
                }, 500);
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    } else {
      this.toastr.error('Could not open print window. Please allow popups.', 'Error');
    }
  }

  onPrintGroup(group: any): void {
    if (!group.pickingNo) {
      this.toastr.warning('No picking number associated with this group.', 'Warning');
      return;
    }

    this.isLoading.set(true);
    this.reconciliationService.printPickingSlip(group.pickingNo).subscribe({
      next: (pdfBlob) => {
        this.isLoading.set(false);
        this.printBlob(pdfBlob);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorHandler.handleErrorWithToster(err);
      }
    });
  }

  onDeleteGroup(group: any): void {
    if (!group.pickingNo) return;
    Swal.fire({
      title: 'Delete Progress?',
      text: `Are you sure you want to delete progress for Picking No: "${group.pickingNo}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, Delete it!',
      cancelButtonText: 'Cancel'
    }).then((result: SweetAlertResult) => {
      if (result.isConfirmed) {
        this.isLoading.set(true);
        this.pickingService.deleteProgress(group.pickingNo).subscribe({
          next: (res) => {
            this.isLoading.set(false);
            if (res.success) {
              this.toastr.success(res.message || 'Progress deleted successfully.', 'Success');
              this.loadTempProgress();
            } else {
              this.toastr.error(res.message || 'Failed to delete progress.', 'Error');
            }
          },
          error: (err) => {
            this.isLoading.set(false);
            this.errorHandler.handleErrorWithToster(err);
          }
        });
      }
    });
  }
}
