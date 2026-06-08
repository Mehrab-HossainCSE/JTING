import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductReceiveService } from '../../../../core/services/receiveServices/product-receive-service';
import { StorageService } from '../../../../core/services/storage.service';
import { ToastrService } from 'ngx-toastr';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';
import { ProductReceiveItem } from '../../../../core/models/receives/product-receive/product-receive';

interface SummaryItem {
  skuCode: string;
  skuName: string;
  qty: number;
}

@Component({
  selector: 'app-auto-receive',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auto-receive.html',
  styleUrl: './auto-receive.scss',
})
export class AutoReceive implements OnInit {
  private receiveService = inject(ProductReceiveService);
  private storageService = inject(StorageService);
  private toastr = inject(ToastrService);
  private errorHandler = inject(ErrorHandlerService);

  barcodeInput = signal<string>('');
  scannedItems = signal<ProductReceiveItem[]>([]);
  batchItems = signal<any[]>([]);

  // Computed signals
  summaryItems = computed(() => {
    const items = this.scannedItems();
    const summaryMap = new Map<string, SummaryItem>();
    items.forEach(item => {
      const code = item.skucode || '';
      const name = item.skuname || '';
      const qty = item.qty || 1;
      const existing = summaryMap.get(code);
      if (existing) {
        existing.qty += qty;
      } else {
        summaryMap.set(code, {
          skuCode: code,
          skuName: name,
          qty: qty
        });
      }
    });
    return Array.from(summaryMap.values());
  });

  totalCartons = computed(() => {
    return this.scannedItems().length;
  });

  scannedEntries = computed(() => {
    return this.scannedItems().length;
  });

  latestScannedItems = computed(() => {
    return this.scannedItems().slice(0, 5);
  });

  skuCount = computed(() => {
    return this.summaryItems().length;
  });

  ngOnInit(): void {
    this.loadScannedItemsFromStorage();
    this.loadBatchDetails();
  }

  private loadScannedItemsFromStorage(): void {
    try {
      const encrypted = this.storageService.getItem<string>('scanned_barcodes');
      if (encrypted) {
        const decrypted = atob(encrypted);
        const parsed = JSON.parse(decrypted);
        if (Array.isArray(parsed)) {
          this.scannedItems.set(parsed);
        }
      }
    } catch (error) {
      console.error('Error loading scanned items from storage:', error);
    }
  }

  private saveScannedItemsToStorage(items: ProductReceiveItem[]): void {
    try {
      const serialized = JSON.stringify(items);
      const encrypted = btoa(serialized);
      this.storageService.setItem('scanned_barcodes', encrypted);
    } catch (error) {
      console.error('Error saving scanned items to storage:', error);
    }
  }

  loadBatchDetails(): void {
    this.receiveService.getPalletsByCurrentDate().subscribe({
      next: (response) => {
        if (response && response.success && response.data) {
          this.batchItems.set(response.data);
        }
      },
      error: (error) => {
        this.errorHandler.handleErrorWithToster(error);
      }
    });
  }

  onBarcodeEnter(): void {
    const code = this.barcodeInput().trim();
    if (!code) return;

    this.receiveService.barcodeScan(code).subscribe({
      next: (response) => {
        if (response && response.success && response.data) {
          const newItem = response.data;
          
          this.scannedItems.update(items => {
            const updated = [newItem, ...items];
            this.saveScannedItemsToStorage(updated);
            return updated;
          });

          this.toastr.success(response.message || 'Product scanned successfully.', 'Success');
          this.barcodeInput.set('');
          this.loadBatchDetails();
        } else {
          this.toastr.error(response?.message || 'Failed to scan product.', 'Error');
        }
      },
      error: (error) => {
        this.errorHandler.handleErrorWithToster(error);
      }
    });
  }

  onConfirm(): void {
    const code = this.barcodeInput().trim();
    if (code) {
      this.onBarcodeEnter();
    }
  }

  onClear(): void {
    this.barcodeInput.set('');
    this.scannedItems.set([]);
    this.storageService.removeItem('scanned_barcodes');
    this.toastr.info('Cleared all scanned records from memory and local storage.', 'Cleared');
  }
}