import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import Swal, { SweetAlertResult } from 'sweetalert2';
import { ApiResponse } from '../../../../../../core/models/ApiResponse.model';

// Service Imports
import { BlockService } from '../../../../../../core/services/setupServices/block-service';
import { ArchService } from '../../../../../../core/services/setupServices/arch-service';
import { LineService } from '../../../../../../core/services/setupServices/line-service';
import { BoxService } from '../../../../../../core/services/setupServices/box-service';
import { UserService } from '../../../../../../core/services/userManageServices/user-service';
import { SkuService } from '../../../../../../core/services/skuServices/sku-service';
import { TransferRestoreService } from '../../../../../../core/services/pickingServices/transfer-restore.service';
import { ErrorHandlerService } from '../../../../../../core/services/error-handler.service';
import { AuthService } from '../../../../../../core/services/auth.service';

// Model Imports
import { Block } from '../../../../../../core/models/setups/block/block';
import { Arch } from '../../../../../../core/models/setups/arch/arch';
import { Line } from '../../../../../../core/models/setups/line/line';
import { UserManage } from '../../../../../../core/models/userManage/user.model';
import { TransferRestoreItem, SaveRestoreRequest } from '../../../../../../core/models/picking/transfer-restore';
import { LoaderService } from '../../../../../../core/services/loader.service';

@Component({
  selector: 'app-restore-from-pa',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './restore-from-pa.html',
  styleUrl: './restore-from-pa.scss'
})
export class RestoreFromPa implements OnInit {
  private toastr = inject(ToastrService);
  private blockService = inject(BlockService);
  private archService = inject(ArchService);
  private lineService = inject(LineService);
  private boxService = inject(BoxService);
  private userService = inject(UserService);
  private skuService = inject(SkuService);
  private transferRestoreService = inject(TransferRestoreService);
  private errorHandler = inject(ErrorHandlerService);
  private authService = inject(AuthService);
  private loaderService = inject(LoaderService);

  isLoading = signal(false);

  // Selected filter values
  selectedSku = signal('');
  selectedBatch = signal('');
  selectedPicker = signal('');
  selectedBlock = signal('');
  selectedArch = signal('');
  selectedLine = signal('');

  // Dropdown Lists
  skuList = signal<{ skuCode: string; skuName: string }[]>([]);
  batchList = signal<string[]>([]);
  users = signal<UserManage[]>([]);
  blocks = signal<Block[]>([]);
  archList = signal<Arch[]>([]);
  lineList = signal<Line[]>([]);

  // Raw and filtered pallets
  rawPallets = signal<TransferRestoreItem[]>([]);
  sourcePallets = signal<any[]>([]);
  destLocations = signal<any[]>([]);

  // Computed checkboxes states
  isSourceAllSelected = computed(() => {
    const list = this.sourcePallets();
    if (list.length === 0) return false;
    return list.every(item => item.checked);
  });

  isDestAllSelected = computed(() => {
    const list = this.destLocations();
    if (list.length === 0) return false;
    return list.every(item => item.checked);
  });

  ngOnInit(): void {
    this.loadBlocks();
    this.loadUsers();
    this.loadSkus();

    const loggedInUser = this.authService.getLocalStorageUserName();
    if (loggedInUser) {
      this.selectedPicker.set(loggedInUser);
    }
  }

  // Load Initial Shared Data
  loadBlocks(): void {
    this.blockService.getAll().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.blocks.set(res.data);
        } else {
          this.toastr.error(res.message || 'Failed to load Blocks.', 'Error');
        }
      },
      error: (err) => this.errorHandler.handleErrorWithToster(err)
    });
  }

  loadUsers(): void {
    this.userService.getAll().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.users.set(res.data.filter(u => u.active));
        } else {
          this.toastr.error(res.message || 'Failed to load Users.', 'Error');
        }
      },
      error: (err) => this.errorHandler.handleErrorWithToster(err)
    });
  }

  loadSkus(): void {
    this.skuService.getAll().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.skuList.set(res.data.map(sku => ({ skuCode: sku.skucode, skuName: sku.skuname })));
        } else {
          this.toastr.error(res.message || 'Failed to load SKUs.', 'Error');
        }
      },
      error: (err) => this.errorHandler.handleErrorWithToster(err)
    });
  }

  // Cascading Logic - Left (Source) Filters
  onSkuChange(skuCode: string): void {
    this.selectedSku.set(skuCode);
    this.selectedBatch.set('');
    this.batchList.set([]);
    this.rawPallets.set([]);
    this.sourcePallets.set([]);

    if (skuCode) {
      this.isLoading.set(true);
      this.loaderService.show('Loading batches...');
      this.transferRestoreService.getPickingSkuBatches(skuCode).subscribe({
        next: (res) => {
          this.isLoading.set(false);
          this.loaderService.hide();
          if (res.success && res.data) {
            this.rawPallets.set(res.data);
            const uniqueBatches = [...new Set(res.data.map((item: any) => item.batchNo).filter(b => !!b))];
            this.batchList.set(uniqueBatches as string[]);
          } else {
            this.toastr.error(res.message || 'Failed to load batches for the selected SKU.', 'Error');
          }
        },
        error: (err) => {
          this.isLoading.set(false);
          this.loaderService.hide();
          this.errorHandler.handleErrorWithToster(err);
        }
      });
    }
  }

  onBatchChange(batchNo: string): void {
    this.selectedBatch.set(batchNo);
    this.sourcePallets.set([]);

    if (batchNo) {
      this.isLoading.set(true);
      this.loaderService.show('Loading pallets...');
      const skuCode = this.selectedSku();

      this.transferRestoreService.getPickingSkuPallets(skuCode, '', batchNo).subscribe({
        next: (res) => {
          this.isLoading.set(false);
          this.loaderService.hide();
          if (res.success && res.data) {
            // Find selected SKU's name from skuList
            const selectedSkuObj = this.skuList().find(s => s.skuCode === skuCode);
            const skuName = selectedSkuObj ? selectedSkuObj.skuName : '';

            this.sourcePallets.set(res.data.map((p: any) => ({
              ...p,
              controlName: p.controlName || p.sourceBoxLocation || '--',
              skuCode: p.skuCode || p.skucode || skuCode,
              skuName: p.skuName || p.skuname || skuName,
              checked: false
            })));
          } else {
            this.toastr.error(res.message || 'Failed to load Pallets.', 'Error');
          }
        },
        error: (err) => {
          this.isLoading.set(false);
          this.loaderService.hide();
          this.errorHandler.handleErrorWithToster(err);
        }
      });
    }
  }

  // Cascading Logic - Right (Destination) Filters
  onBlockChange(blockId: string): void {
    this.selectedBlock.set(blockId);
    this.selectedArch.set('');
    this.selectedLine.set('');
    this.archList.set([]);
    this.lineList.set([]);
    this.destLocations.set([]);

    if (blockId) {
      this.archService.getByBlockId(blockId).subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.archList.set(res.data);
          }
        }
      });
    }
  }

  onArchChange(archId: string): void {
    this.selectedArch.set(archId);
    this.selectedLine.set('');
    this.lineList.set([]);
    this.destLocations.set([]);

    if (archId) {
      this.lineService.getByArchId(archId).subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.lineList.set(res.data);
          }
        }
      });
    }
  }

  onLineChange(lineId: string): void {
    this.selectedLine.set(lineId);
    this.destLocations.set([]);

    if (lineId) {
      this.isLoading.set(true);
      this.loaderService.show('Loading destination locations...');
      const numericLineId = Number(lineId) || 0;
      const numericArchId = Number(this.selectedArch()) || 0;
      const skuCode = this.selectedSku() || '';
      const batchNo = this.selectedBatch() || '';
      const restoreNo = '';

      this.transferRestoreService.getRestoreDestinationLocations(numericLineId, numericArchId, skuCode, restoreNo).subscribe({
        next: (res) => {
          this.isLoading.set(false);
          this.loaderService.hide();
          if (res.success && res.data) {
            this.destLocations.set(res.data.map((l: any) => ({ ...l, checked: false })));
          } else {
            this.toastr.error(res.message || 'Failed to load destination locations.', 'Error');
          }
        },
        error: (err) => {
          this.isLoading.set(false);
          this.loaderService.hide();
          this.errorHandler.handleErrorWithToster(err);
        }
      });
    }
  }

  // Checkbox interactions
  toggleSourceAll(checked: boolean): void {
    this.sourcePallets.update(current => current.map(item => ({ ...item, checked })));
  }

  onPalletCheckChange(index: number, checked: boolean): void {
    this.sourcePallets.update(current => {
      const updated = [...current];
      if (updated[index]) {
        updated[index] = { ...updated[index], checked };
      }
      return updated;
    });
  }

  toggleDestAll(checked: boolean): void {
    this.destLocations.update(current => current.map(item => ({ ...item, checked })));
  }

  onLocationCheckChange(index: number, checked: boolean): void {
    this.destLocations.update(current => {
      const updated = [...current];
      if (updated[index]) {
        updated[index] = { ...updated[index], checked };
      }
      return updated;
    });
  }

  onConfirmRestore() {
    const selectedPallets = this.sourcePallets().filter(p => p.checked);
    const selectedDests = this.destLocations().filter(l => l.checked);

    if (selectedPallets.length === 0) {
      this.toastr.warning('Please select at least one Source Pallet.', 'Warning');
      return;
    }
    if (!this.selectedPicker()) {
      this.toastr.warning('Please select a Picker.', 'Warning');
      return;
    }
    if (selectedDests.length === 0) {
      this.toastr.warning('Please select at least one Destination Location.', 'Warning');
      return;
    }

    Swal.fire({
      title: 'You want to restore?',
      text: `Do you want to restore ${selectedPallets.length} pallet(s) to ${selectedDests.length} location(s)?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#00bb31',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, restore',
      cancelButtonText: 'No, cancel'
    }).then((result: SweetAlertResult) => {
      if (result.isConfirmed) {
        this.executeRestore(selectedPallets, selectedDests);
      }
    });
  }

  private executeRestore(pallets: any[], locations: any[]): void {
    this.isLoading.set(true);
    this.loaderService.show('Restoring pallets...');

    const activeSku = this.skuList().find(s => s.skuCode === this.selectedSku());

    const payload: SaveRestoreRequest = {
      sourceList: pallets.map(p => {
        const { checked, ...rest } = p;
        return rest as TransferRestoreItem;
      }),
      destinationList: locations.map(l => {
        const { checked, ...rest } = l;
        return rest as TransferRestoreItem;
      }),
      pickerName: this.selectedPicker(),
      restoreNo: '',
      batchNo: this.selectedBatch(),
      skuCode: this.selectedSku(),
      skuName: activeSku?.skuName || '',
      isUpdate: false
    };

    this.transferRestoreService.saveRestore(payload).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.loaderService.hide();
        if (res.success) {
          this.toastr.success(res.message || 'Pallets restored successfully.', 'Success');
          this.onReset();
        } else {
          this.toastr.error(res.message || 'Failed to restore pallets.', 'Error');
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        this.loaderService.hide();
        this.errorHandler.handleErrorWithToster(err);
      }
    });
  }

  onReset() {
    this.selectedSku.set('');
    this.selectedBatch.set('');
    this.selectedBlock.set('');
    this.selectedArch.set('');
    this.selectedLine.set('');

    this.batchList.set([]);
    this.rawPallets.set([]);
    this.sourcePallets.set([]);
    this.destLocations.set([]);

    this.archList.set([]);
    this.lineList.set([]);

    const loggedInUser = this.authService.getLocalStorageUserName();
    if (loggedInUser) {
      this.selectedPicker.set(loggedInUser);
    } else {
      this.selectedPicker.set('');
    }
  }
}
