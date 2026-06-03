import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import Swal, { SweetAlertResult } from 'sweetalert2';
import { StorageService } from '../../../../core/services/storage.service';
import { MenuResponse } from '../../../../core/models/MenuResponse';

interface SkuItem {
  code: string;
  name: string;
}

interface BoxLocation {
  location: string;
  selected: boolean;
  block: string;
  arch: string;
  line: string;
}

interface QuarantineRecord {
  quarantineNo: string;
  skuDescription: string;
  palletQty: number;
  createDate: string;
}

interface PalletDetail {
  boxLocation: string;
  palletNo: string;
  batchNo: string;
  receiveDate: string;
  qty: number;
  status: 'Pending' | 'Reviewing' | 'Released' | 'Destroyed';
  skuCode: string;
}

@Component({
  selector: 'app-quarantine',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './quarantine.html',
  styleUrl: './quarantine.scss',
})
export class Quarantine implements OnInit {
  private toastr         = inject(ToastrService);
  private storageService = inject(StorageService);

  // ── Permissions ──────────────────────────────────────────────────────
  permissions = signal({
    canView: true,     // Default to true for hardcoded design so it always displays
    canCreate: true,
    canUpdate: true,
    canDelete: true,
  });

  canView   = computed(() => this.permissions().canView);
  canCreate = computed(() => this.permissions().canCreate);
  canUpdate = computed(() => this.permissions().canUpdate);
  canDelete = computed(() => this.permissions().canDelete);

  // ── Mock Data lists ──────────────────────────────────────────────────
  skus: SkuItem[] = [
    { code: '15107995', name: 'Navy Special Filter 10s' },
    { code: '15107992', name: 'Navy Special Filter 20s' },
    { code: '15108001', name: 'Navy Option 10s' },
    { code: '15109078', name: 'Sheikh Full Flavour 10s' },
    { code: '15109099', name: 'Real Filter Kings 20s' },
  ];

  blocks: string[] = ['FG1', 'FG2', 'FG3', 'N1', 'N2'];
  archesMap: Record<string, string[]> = {
    'FG1': ['FG-1-ARCH-1', 'FG-1-ARCH-2', 'FG-1-ARCH-3', 'FG-1-ARCH-4'],
    'FG2': ['FG-2-ARCH-1', 'FG-2-ARCH-2'],
    'FG3': ['FG-3-ARCH-1', 'FG-3-ARCH-2', 'FG-3-ARCH-3'],
    'N1': ['N-1-ARCH-1'],
    'N2': ['N-2-ARCH-1', 'N-2-ARCH-2'],
  };

  linesMap: Record<string, string[]> = {
    'FG-1-ARCH-1': ['L1', 'L2'],
    'FG-1-ARCH-2': ['L1', 'L3'],
    'FG-1-ARCH-3': ['L2', 'L3'],
    'FG-1-ARCH-4': ['L1', 'L2', 'L3'],
    'FG-2-ARCH-1': ['L1', 'L2'],
    'FG-2-ARCH-2': ['L2', 'L3'],
    'FG-3-ARCH-1': ['L1'],
    'FG-3-ARCH-2': ['L2'],
    'FG-3-ARCH-3': ['L3'],
    'N-1-ARCH-1': ['L1', 'L2'],
    'N-2-ARCH-1': ['L1'],
    'N-2-ARCH-2': ['L2', 'L3'],
  };

  // State Signals
  boxesState = signal<BoxLocation[]>([
    { location: 'FG1A04L01B01', selected: false, block: 'FG1', arch: 'FG-1-ARCH-4', line: 'L1' },
    { location: 'FG1A04L01B02', selected: false, block: 'FG1', arch: 'FG-1-ARCH-4', line: 'L1' },
    { location: 'FG1A04L02B01', selected: false, block: 'FG1', arch: 'FG-1-ARCH-4', line: 'L2' },
    { location: 'FG1A01L01B01', selected: false, block: 'FG1', arch: 'FG-1-ARCH-1', line: 'L1' },
    { location: 'FG1A01L01B02', selected: false, block: 'FG1', arch: 'FG-1-ARCH-1', line: 'L1' },
    { location: 'FG2A01L02B01', selected: false, block: 'FG2', arch: 'FG-2-ARCH-1', line: 'L2' },
    { location: 'FG3A02L02B02', selected: false, block: 'FG3', arch: 'FG-3-ARCH-2', line: 'L2' },
  ]);

  recordsState = signal<QuarantineRecord[]>([
    { quarantineNo: 'QRN-00001', skuDescription: 'Navy Special Filter 10s - 15107995', palletQty: 24, createDate: '4/5/2026' },
    { quarantineNo: 'QRN-00002', skuDescription: 'Navy Special Filter 10s - 15107995', palletQty: 20, createDate: '4/5/2026' },
  ]);

  palletsState = signal<PalletDetail[]>([
    { boxLocation: 'FG1A04L01B01', palletNo: 'PLT-2024-001', batchNo: 'B-41761090', receiveDate: '4/5/2026', qty: 24, status: 'Pending', skuCode: '15107995' },
    { boxLocation: 'FG1A04L01B02', palletNo: 'PLT-2024-002', batchNo: 'B-41761091', receiveDate: '4/5/2026', qty: 20, status: 'Reviewing', skuCode: '15107995' },
    { boxLocation: 'FG1A04L02B01', palletNo: 'PLT-2024-003', batchNo: 'B-41761092', receiveDate: '4/5/2026', qty: 30, status: 'Pending', skuCode: '15107992' },
    { boxLocation: 'FG1A01L01B01', palletNo: 'PLT-2024-004', batchNo: 'B-41761093', receiveDate: '4/5/2026', qty: 15, status: 'Reviewing', skuCode: '15108001' },
  ]);

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
    this.loadPermissionsFromStorage();
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
        canView:   !!qMenu.canView,
        canCreate: !!qMenu.canCreate,
        canUpdate: !!qMenu.canUpdate,
        canDelete: !!qMenu.canDelete,
      });
    }
  }

  // ── Cascading Dropdowns ──────────────────────────────────────────────
  filteredArches = computed(() => {
    const block = this.filterBlock;
    if (!block) return [];
    return this.archesMap[block] || [];
  });

  filteredLines = computed(() => {
    const arch = this.filterArch;
    if (!arch) return [];
    return this.linesMap[arch] || [];
  });

  onBlockChange(): void {
    this.filterArch = '';
    this.filterLine = '';
  }

  onArchChange(): void {
    this.filterLine = '';
  }

  // ── Search Handler ───────────────────────────────────────────────────
  search(): void {
    this.activeFilterSku.set(this.filterSku);
    this.activeFilterBlock.set(this.filterBlock);
    this.activeFilterArch.set(this.filterArch);
    this.activeFilterLine.set(this.filterLine);
    this.activeFromDate.set(this.fromDate);
    this.activeToDate.set(this.toDate);
    this.activeQuarantineNo.set(this.quarantineNoQuery.trim());
    this.toastr.success('Search filters applied', 'Filters');
  }

  // ── Filtered Computations ────────────────────────────────────────────
  filteredBoxes = computed(() => {
    const block = this.activeFilterBlock();
    const arch = this.activeFilterArch();
    const line = this.activeFilterLine();

    return this.boxesState().filter(box => {
      if (block && box.block !== block) return false;
      if (arch && box.arch !== arch) return false;
      if (line && box.line !== line) return false;
      return true;
    });
  });

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

  filteredPallets = computed(() => {
    const block = this.activeFilterBlock();
    const arch = this.activeFilterArch();
    const line = this.activeFilterLine();
    const sku = this.activeFilterSku();

    return this.palletsState().filter(p => {
      // Find matches in our box state to check locations
      const box = this.boxesState().find(b => b.location === p.boxLocation);
      if (block && box?.block !== block) return false;
      if (arch && box?.arch !== arch) return false;
      if (line && box?.line !== line) return false;
      if (sku && p.skuCode !== sku) return false;
      return true;
    });
  });

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
    if (matchedPallets.length === 0) {
      this.toastr.warning('No matching pallets found in the selected locations to quarantine.', 'Warning');
      return;
    }

    const totalQty = matchedPallets.reduce((sum, p) => sum + p.qty, 0);
    const skuCode = matchedPallets[0].skuCode;
    const skuName = this.skus.find(s => s.code === skuCode)?.name || 'Unknown SKU';

    // Generate new Quarantine Record
    const nextNum = this.recordsState().length + 1;
    const qrnNo = `QRN-${nextNum.toString().padStart(5, '0')}`;
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

    this.toastr.success(`Quarantine record ${qrnNo} created successfully!`, 'Success');
  }

  // ── Release Pallet ───────────────────────────────────────────────────
  releasePallet(pallet: PalletDetail): void {
    if (!this.canUpdate()) {
      this.toastr.error('You do not have permission to release quarantine items.', 'Access Denied');
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
        this.palletsState.update(list =>
          list.map(p => (p.palletNo === pallet.palletNo ? { ...p, status: 'Released' } : p))
        );
        this.toastr.success(`Pallet ${pallet.palletNo} released.`, 'Released');
      }
    });
  }

  // ── Destroy Pallet ───────────────────────────────────────────────────
  destroyPallet(pallet: PalletDetail): void {
    if (!this.canDelete()) {
      this.toastr.error('You do not have permission to destroy quarantine items.', 'Access Denied');
      return;
    }

    Swal.fire({
      title: 'Destroy Pallet?',
      text: `WARNING: Are you sure you want to permanently destroy Pallet "${pallet.palletNo}"? This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, Destroy it!',
    }).then((result: SweetAlertResult) => {
      if (result.isConfirmed) {
        this.palletsState.update(list =>
          list.map(p => (p.palletNo === pallet.palletNo ? { ...p, status: 'Destroyed' } : p))
        );
        this.toastr.error(`Pallet ${pallet.palletNo} destroyed.`, 'Destroyed');
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
              ${this.skus.map(s => `<option value="${s.code}">${s.name} (${s.code})</option>`).join('')}
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
        const skuName = this.skus.find(s => s.code === skuCode)?.name || 'Unknown SKU';
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
