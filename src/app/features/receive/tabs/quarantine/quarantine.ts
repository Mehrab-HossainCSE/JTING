import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import Swal, { SweetAlertResult } from 'sweetalert2';
import { StorageService } from '../../../../core/services/storage.service';
import { MenuResponse } from '../../../../core/models/MenuResponse';
import { SkuService } from '../../../../core/services/skuServices/sku-service';
import { ArchService } from '../../../../core/services/setupServices/arch-service';
import { BlockService } from '../../../../core/services/setupServices/block-service';
import { LineService } from '../../../../core/services/setupServices/line-service';
import { Sku } from '../../../../core/models/setups/sku/sku';
import { Block } from '../../../../core/models/setups/block/block';
import { Arch } from '../../../../core/models/setups/arch/arch';
import { Line } from '../../../../core/models/setups/line/line';
import { QuarantineService } from '../../../../core/services/receiveServices/quarantine-service';
import { BoxLocation, QuarantineRecord, PalletDetail } from '../../../../core/models/receives/quarantine/quarantine';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';

@Component({
  selector: 'app-quarantine',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './quarantine.html',
  styleUrl: './quarantine.scss',
})
export class Quarantine implements OnInit {
  private toastr = inject(ToastrService);
  private storageService = inject(StorageService);

  private skuService = inject(SkuService);
  private blockService = inject(BlockService);
  private archService = inject(ArchService);
  private lineService = inject(LineService);
  private quarantineService = inject(QuarantineService);
  private errorHandler = inject(ErrorHandlerService);


  // ── Permissions ──────────────────────────────────────────────────────
  permissions = signal({
    canView: true,     // Default to true for hardcoded design so it always displays
    canCreate: true,
    canUpdate: true,
    canDelete: true,
  });

  canView = computed(() => this.permissions().canView);
  canCreate = computed(() => this.permissions().canCreate);
  canUpdate = computed(() => this.permissions().canUpdate);
  canDelete = computed(() => this.permissions().canDelete);

  // ── Dropdown Option Signals ──────────────────────────────────────────
  skus = signal<Sku[]>([]);
  blocks = signal<Block[]>([]);
  arches = signal<Arch[]>([]);
  lines = signal<Line[]>([]);

  // State Signals
  boxesState = signal<BoxLocation[]>([]);

  recordsState = signal<QuarantineRecord[]>([]);

  palletsState = signal<PalletDetail[]>([]);

  selectedQuarantineNo = signal('');

  // Filters State
  filterSku = '';
  filterBlock = '';
  filterArch = '';
  filterLine = '';
  allSelect = false;
  fromDate = '';
  toDate = '';
  quarantineNoQuery = '';

  // Active filters applied
  activeFilterSku = signal('');
  activeFilterBlock = signal('');
  activeFilterArch = signal('');
  activeFilterLine = signal('');
  activeFromDate = signal('');
  activeToDate = signal('');
  activeQuarantineNo = signal('');

  // Remarks state
  remarks = '';

  // ── Lifecycle ────────────────────────────────────────────────────────
  ngOnInit(): void {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const todayStr = `${yyyy}-${mm}-${dd}`;
    this.fromDate = todayStr;
    this.toDate = todayStr;

    this.loadPermissionsFromStorage();
    this.loadSkus();
  }

  private loadPermissionsFromStorage(): void {
    const menus = this.storageService.getAngularItem<MenuResponse[]>('menus');
    const parentMenu = menus?.find(
      (m) => m.name?.toUpperCase() === 'RECEIVE_MODULE' || m.url?.toLowerCase() === '/receive'
    );
    const qMenu = parentMenu?.children?.find(
      (c) =>
        c.url?.toLowerCase() === '/quarantine' ||
        c.name?.toUpperCase() === 'QUARANTINE'
    );

    if (qMenu) {
      this.permissions.set({
        canView: !!qMenu.canView,
        canCreate: !!qMenu.canCreate,
        canUpdate: !!qMenu.canUpdate,
        canDelete: !!qMenu.canDelete,
      });
    }
  }

  loadSkus(): void {
    this.skuService.getSKUWithOutESL().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.skus.set(res.data);
        } else {
          this.toastr.error(res.message || 'Failed to load SKUs', 'Error');
        }
      },
      error: (err) => {
        this.errorHandler.handleErrorWithToster(err);
      }
    });
  }

  // ── Cascading Dropdowns ──────────────────────────────────────────────
  onSkuChange(): void {
    this.filterBlock = '';
    this.filterArch = '';
    this.filterLine = '';
    this.blocks.set([]);
    this.arches.set([]);
    this.lines.set([]);

    if (this.filterSku) {
      this.quarantineService.getAllBySkuCode(this.filterSku).subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.blocks.set(res.data);
          } else {
            this.toastr.error(res.message || 'Failed to load blocks', 'Error');
          }
        },
        error: (err) => {
          this.errorHandler.handleErrorWithToster(err);
        }
      });
    }
  }

  onBlockChange(): void {
    this.filterArch = '';
    this.filterLine = '';
    this.arches.set([]);
    this.lines.set([]);

    if (this.filterBlock && this.filterSku) {
      this.archService.getAllByBlockAndSku(this.filterBlock, this.filterSku).subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.arches.set(res.data);
          } else {
            this.toastr.error(res.message || 'Failed to load arches', 'Error');
          }
        },
        error: (err) => {
          this.errorHandler.handleErrorWithToster(err);
        }
      });
    }
  }

  onArchChange(): void {
    this.filterLine = '';
    this.lines.set([]);

    if (this.filterArch) {
      this.lineService.getAllByArch(this.filterArch).subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.lines.set(res.data);
          } else {
            this.toastr.error(res.message || 'Failed to load lines', 'Error');
          }
        },
        error: (err) => {
          this.errorHandler.handleErrorWithToster(err);
        }
      });
    }
  }

  onLineChange(): void {
    if (this.filterLine && this.filterSku) {
      const qNo = this.quarantineNoQuery.trim();
      this.quarantineService.getSkuAndLineWiseLocation(this.filterLine, this.filterSku, qNo).subscribe({
        next: (res) => {
          if (res.success && res.data) {
            const mappedBoxes: BoxLocation[] = res.data.map((item: any) => ({
              location: item.controlName,
              selected: false,
              block: this.filterBlock,
              arch: this.filterArch,
              line: this.filterLine
            }));
            this.boxesState.set(mappedBoxes);
            this.updateAllSelectState();
          } else {
            this.toastr.error(res.message || 'Failed to load locations', 'Error');
          }
        },
        error: (err) => {
          this.errorHandler.handleErrorWithToster(err);
        }
      });
    }
  }

  // ── Search Handler ───────────────────────────────────────────────────
  search(showToast = true): void {
    this.activeFilterSku.set(this.filterSku);
    this.activeFilterBlock.set(this.filterBlock);
    this.activeFilterArch.set(this.filterArch);
    this.activeFilterLine.set(this.filterLine);
    this.activeFromDate.set(this.fromDate);
    this.activeToDate.set(this.toDate);
    this.activeQuarantineNo.set(this.quarantineNoQuery.trim());

    if (this.fromDate && this.toDate) {
      this.quarantineService.getQuarantineByDate(this.fromDate, this.toDate).subscribe({
        next: (res) => {
          if (res.success && res.data) {
            const mappedRecords: QuarantineRecord[] = res.data.map((item: any) => ({
              quarantineNo: item.quarantineNo,
              skuDescription: `${item.skuname} - ${item.skucode}`,
              palletQty: item.qty,
              createDate: item.createDate
            }));
            this.recordsState.set(mappedRecords);
            if (showToast) {
              this.toastr.success('Search filters applied', 'Filters');
            }
          } else {
            this.toastr.error(res.message || 'No records found', 'Error');
          }
        },
        error: (err) => {
          this.errorHandler.handleErrorWithToster(err);
        }
      });
    } else {
      if (showToast) {
        this.toastr.success('Search filters applied', 'Filters');
      }
    }
  }

  onRecordClick(rec: QuarantineRecord): void {
    this.selectedQuarantineNo.set(rec.quarantineNo);
    this.quarantineService.getQuarantineDetailsData(rec.quarantineNo).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          const mappedPallets: PalletDetail[] = res.data.map((item: any) => ({
            boxLocation: item.controlName,
            palletNo: item.palletNo,
            batchNo: item.batchNo,
            receiveDate: item.rcvDate,
            qty: item.qty,
            status: item.status,
            skuCode: item.skuCode || item.skucode || ''
          }));
          this.palletsState.set(mappedPallets);
        } else {
          this.toastr.error(res.message || 'Failed to load details', 'Error');
        }
      },
      error: (err) => {
        this.errorHandler.handleErrorWithToster(err);
      }
    });
  }

  // ── Filtered Computations ────────────────────────────────────────────
  filteredBoxes = computed(() => this.boxesState());

  filteredRecords = computed(() => {
    const sku = this.activeFilterSku();
    const qNo = this.activeQuarantineNo();
    const fDate = this.activeFromDate();
    const tDate = this.activeToDate();

    return this.recordsState().filter(rec => {
      if (sku && !rec.skuDescription.includes(sku)) return false;
      if (qNo && !rec.quarantineNo.toLowerCase().includes(qNo.toLowerCase())) return false;

      if (fDate || tDate) {
        const dateObj = new Date(rec.createDate);
        if (fDate && dateObj < new Date(fDate)) return false;
        if (tDate && dateObj > new Date(tDate)) return false;
      }
      return true;
    });
  });

  filteredPallets = computed(() => this.palletsState());

  // ── All Select Logic ─────────────────────────────────────────────────
  toggleAllSelect(): void {
    const targetState = this.allSelect;
    this.filteredBoxes().forEach(box => {
      box.selected = targetState;
    });
  }

  updateAllSelectState(): void {
    const boxes = this.filteredBoxes();
    if (boxes.length === 0) {
      this.allSelect = false;
      return;
    }
    this.allSelect = boxes.every(b => b.selected);
  }

  // ── Make Quarantine ──────────────────────────────────────────────────
  hasSelectedBoxes(): boolean {
    return this.boxesState().some(b => b.selected);
  }

  makeQuarantine(): void {
    if (!this.canCreate()) {
      this.toastr.error('You do not have permission to create quarantine records.', 'Access Denied');
      return;
    }

    const selectedLocations = this.boxesState()
      .filter(b => b.selected)
      .map(b => b.location);

    if (selectedLocations.length === 0) {
      this.toastr.warning('Please select at least one box/location.', 'Warning');
      return;
    }

    const matchedPallets = this.palletsState().filter(p => selectedLocations.includes(p.boxLocation));
    const totalQty = matchedPallets.reduce((sum, p) => sum + p.qty, 0);
    const skuCode = this.filterSku || (matchedPallets.length > 0 ? matchedPallets[0].skuCode : '');
    const skuName = this.skus().find(s => s.skucode === skuCode)?.skuname || 'Unknown SKU';

    // Generate new Quarantine Record (fallback temporary ID if backend doesn't return one)
    const nextNum = this.recordsState().length + 1;
    const fallbackQrnNo = `QRN-${nextNum.toString().padStart(5, '0')}`;

    const payload = {
      controlNames: selectedLocations,
      quarantineNo: '',
      remarks: this.remarks.trim()
    };

    this.quarantineService.setLocationQuarantine(payload).subscribe({
      next: (res) => {
        if (res.success) {
          const qrnNo = res.data?.quarantineNo || res.data || fallbackQrnNo;
          const newRecord: QuarantineRecord = {
            quarantineNo: qrnNo,
            skuDescription: `${skuName} - ${skuCode}`,
            palletQty: totalQty,
            createDate: new Date().toLocaleDateString(),
          };

          // Update Pallets status to 'Pending' in quarantine
          this.palletsState.update(list =>
            list.map(p => {
              if (selectedLocations.includes(p.boxLocation)) {
                return { ...p, status: 'Pending' };
              }
              return p;
            })
          );

          // Add to records list
          this.recordsState.update(list => [newRecord, ...list]);

          // Reset remarks and selection
          this.remarks = '';
          this.boxesState.update(list =>
            list.map(b => ({ ...b, selected: false }))
          );
          this.allSelect = false;

          this.toastr.success(res.message || `Quarantine record ${qrnNo} created successfully!`, 'Success');

          // Auto-trigger search to update Quarantine Records list
          this.search(false);
        } else {
          this.toastr.error(res.message || 'Failed to create quarantine record', 'Error');
        }
      },
      error: (err) => {
        this.errorHandler.handleErrorWithToster(err);
      }
    });
  }

  // ── Release Pallet ───────────────────────────────────────────────────
  releasePallet(pallet: PalletDetail): void {
    if (!this.canUpdate()) {
      this.toastr.error('You do not have permission to release quarantine items.', 'Access Denied');
      return;
    }

    const qNo = this.selectedQuarantineNo();
    if (!qNo) {
      this.toastr.error('No quarantine record selected.', 'Error');
      return;
    }

    Swal.fire({
      title: 'Release Pallet?',
      text: `Are you sure you want to release Pallet "${pallet.palletNo}" from quarantine?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#00BB31',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, Release it!',
    }).then((result: SweetAlertResult) => {
      if (result.isConfirmed) {
        const payload = {
          quarantineNo: qNo,
          palletNo: pallet.palletNo
        };
        this.quarantineService.unQuarantine(payload).subscribe({
          next: (res) => {
            if (res.success) {
              this.palletsState.update(list =>
                list.map(p => (p.palletNo === pallet.palletNo ? { ...p, status: 'Released' } : p))
              );
              this.toastr.success(res.message || `Pallet ${pallet.palletNo} released.`, 'Released');
            } else {
              this.toastr.error(res.message || 'Failed to release pallet', 'Error');
            }
          },
          error: (err) => {
            this.errorHandler.handleErrorWithToster(err);
          }
        });
      }
    });
  }

  // ── Add Quarantine Record Manual ─────────────────────────────────────
  openAddModal(): void {
    if (!this.canCreate()) {
      this.toastr.error('You do not have permission to add quarantine records.', 'Access Denied');
      return;
    }

    Swal.fire({
      title: 'Add Quarantine Record',
      html: `
        <div style="text-align: left;">
          <div class="mb-3">
            <label class="form-label" style="font-size: 0.8rem; font-weight: 700; color: #636e72;">SKU</label>
            <select id="swal-sku" class="form-select" style="width: 100%; padding: 8px; border-radius: 8px; border: 1px solid #ccc;">
              ${this.skus().map(s => `<option value="${s.skucode}">${s.skuname} (${s.skucode})</option>`).join('')}
            </select>
          </div>
          <div class="mb-3">
            <label class="form-label" style="font-size: 0.8rem; font-weight: 700; color: #636e72;">QUANTITY</label>
            <input id="swal-qty" type="number" class="form-control" value="10" style="width: 100%; padding: 8px; border-radius: 8px; border: 1px solid #ccc;" />
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Add Record',
      confirmButtonColor: '#00BB31',
      preConfirm: () => {
        const skuSelect = document.getElementById('swal-sku') as HTMLSelectElement;
        const qtyInput = document.getElementById('swal-qty') as HTMLInputElement;
        return {
          skuCode: skuSelect.value,
          qty: parseInt(qtyInput.value, 10) || 0
        };
      }
    }).then((result: SweetAlertResult) => {
      if (result.isConfirmed && result.value) {
        const { skuCode, qty } = result.value;
        const skuName = this.skus().find(s => s.skucode === skuCode)?.skuname || 'Unknown SKU';
        const nextNum = this.recordsState().length + 1;
        const qrnNo = `QRN-${nextNum.toString().padStart(5, '0')}`;

        const newRecord: QuarantineRecord = {
          quarantineNo: qrnNo,
          skuDescription: `${skuName} - ${skuCode}`,
          palletQty: qty,
          createDate: new Date().toLocaleDateString(),
        };

        this.recordsState.update(list => [newRecord, ...list]);
        this.toastr.success(`Quarantine record ${qrnNo} added manually.`, 'Success');
      }
    });
  }
}
