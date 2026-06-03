import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { StorageService } from '../../../../core/services/storage.service';
import { MenuResponse } from '../../../../core/models/MenuResponse';

interface SkuItem {
  code: string;
  name: string;
}

interface SkuSearchResult {
  block: string;
  arch: string;
  line: string;
  skuCode: string;
  assignedSku: string;
  batch: string;
  boxName: string;
  currentPallet: string;
  qty: number;
  unit: string;
  searchFromPA: boolean;
}

@Component({
  selector: 'app-sku-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sku-search.html',
  styleUrl: './sku-search.scss',
})
export class SkuSearch implements OnInit {
  private toastr         = inject(ToastrService);
  private storageService = inject(StorageService);

  // ── Permissions ──────────────────────────────────────────────────────
  permissions = signal({
    canView: true,     // Default to true for design showcase
    canCreate: true,
    canUpdate: true,
    canDelete: true,
  });

  canView = computed(() => this.permissions().canView);

  // ── Mock Dropdown Data ────────────────────────────────────────────────
  blocks: string[] = ['FG1', 'FG2', 'FG3', 'N1', 'N2'];
  
  archesMap: Record<string, string[]> = {
    'FG1': ['FG-1-ARCH-1', 'FG-1-ARCH-2', 'FG-1-ARCH-3', 'FG-1-ARCH-4'],
    'FG2': ['FG-2-ARCH-1', 'FG-2-ARCH-2'],
    'FG3': ['FG-3-ARCH-1', 'FG-3-ARCH-2'],
    'N1': ['N-1-ARCH-1'],
    'N2': ['N-2-ARCH-1'],
  };

  linesMap: Record<string, string[]> = {
    'FG-1-ARCH-1': ['L1', 'L2'],
    'FG-1-ARCH-2': ['L1', 'L2', 'L3'],
    'FG-1-ARCH-3': ['L2', 'L3'],
    'FG-1-ARCH-4': ['L1', 'L2'],
    'FG-2-ARCH-1': ['L1', 'L2'],
    'FG-2-ARCH-2': ['L2', 'L3'],
    'FG-3-ARCH-1': ['L1'],
    'FG-3-ARCH-2': ['L2'],
    'N-1-ARCH-1': ['L1', 'L2'],
    'N-2-ARCH-1': ['L1', 'L2'],
  };

  skus: SkuItem[] = [
    { code: '15107995', name: 'Navy Special Filter 10s' },
    { code: '15107992', name: 'Navy Special Filter 20s' },
    { code: '15108001', name: 'Navy Option 10s' },
    { code: '15109078', name: 'Sheikh Full Flavour 10s' },
    { code: '15109099', name: 'Real Filter Kings 20s' },
  ];

  units: string[] = ['CS', 'Carton', 'Pallet'];

  // ── Search State ─────────────────────────────────────────────────────
  filterBlock = '';
  filterArch = '';
  filterLine = '';
  filterSku = '';
  filterBox = '';
  filterPalletNo = '';
  filterUnit = 'CS';
  searchFromPA = false;

  // Active filters signal
  activeBlock = signal('');
  activeArch = signal('');
  activeLine = signal('');
  activeSku = signal('');
  activeBox = signal('');
  activePalletNo = signal('');
  activeUnit = signal('CS');
  activeSearchFromPA = signal(false);

  // ── Complete Mock Dataset ────────────────────────────────────────────
  resultsDataset = signal<SkuSearchResult[]>([
    { block: 'FG1', arch: 'FG-1-ARCH-1', line: 'L1', skuCode: '15107995', assignedSku: 'Navy Special Filter 10s', batch: '41761090', boxName: 'FG1A01L01B01', currentPallet: '15107995050426000090', qty: 24, unit: 'CS', searchFromPA: false },
    { block: 'FG1', arch: 'FG-1-ARCH-1', line: 'L2', skuCode: '15107995', assignedSku: 'Navy Special Filter 10s', batch: '41761090', boxName: 'FG1A01L02B01', currentPallet: '15107995050426000090', qty: 24, unit: 'CS', searchFromPA: false },
    { block: 'FG1', arch: 'FG-1-ARCH-2', line: 'L1', skuCode: '15109099', assignedSku: 'Real Filter Kings 20s', batch: '41763557', boxName: 'FG1A02L01B01', currentPallet: '15109099050426000091', qty: 30, unit: 'CS', searchFromPA: false },
    { block: 'FG2', arch: 'FG-2-ARCH-1', line: 'L1', skuCode: '15107992', assignedSku: 'Navy Special Filter 20s', batch: '41761929', boxName: 'FG2A01L01B01', currentPallet: '15107992050426000092', qty: 14, unit: 'CS', searchFromPA: true },
    { block: 'FG2', arch: 'FG-2-ARCH-1', line: 'L2', skuCode: '15107992', assignedSku: 'Navy Special Filter 20s', batch: '41761929', boxName: 'FG2A01L02B01', currentPallet: '15107992050426000092', qty: 18, unit: 'CS', searchFromPA: true },
    { block: 'FG3', arch: 'FG-3-ARCH-2', line: 'L2', skuCode: '15108001', assignedSku: 'Navy Option 10s', batch: '41762828', boxName: 'FG3A02L02B01', currentPallet: '15108001050426000093', qty: 9, unit: 'Carton', searchFromPA: false },
    { block: 'N1', arch: 'N-1-ARCH-1', line: 'L1', skuCode: '15109078', assignedSku: 'Sheikh Full Flavour 10s', batch: '41761087', boxName: 'N1A01L01B01', currentPallet: '15109078050426000094', qty: 2, unit: 'Pallet', searchFromPA: false },
  ]);

  // ── Lifecycle ────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.loadPermissionsFromStorage();
  }

  private loadPermissionsFromStorage(): void {
    const menus = this.storageService.getAngularItem<MenuResponse[]>('menus');
    const parentMenu = menus?.find(
      (m) => m.name?.toUpperCase() === 'RECEIVE_MODULE' || m.url?.toLowerCase() === '/receive'
    );
    const sMenu = parentMenu?.children?.find(
      (c) =>
        c.url?.toLowerCase() === '/sku-search' ||
        c.name?.toUpperCase() === 'SKU_SEARCH'
    );

    if (sMenu) {
      this.permissions.set({
        canView:   !!sMenu.canView,
        canCreate: !!sMenu.canCreate,
        canUpdate: !!sMenu.canUpdate,
        canDelete: !!sMenu.canDelete,
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

  // ── Handlers ─────────────────────────────────────────────────────────
  search(): void {
    this.activeBlock.set(this.filterBlock);
    this.activeArch.set(this.filterArch);
    this.activeLine.set(this.filterLine);
    this.activeSku.set(this.filterSku);
    this.activeBox.set(this.filterBox.trim());
    this.activePalletNo.set(this.filterPalletNo.trim());
    this.activeUnit.set(this.filterUnit);
    this.activeSearchFromPA.set(this.searchFromPA);

    this.toastr.success('Search completed', 'Success');
  }

  resetInput(): void {
    this.filterBlock = '';
    this.filterArch = '';
    this.filterLine = '';
    this.filterSku = '';
    this.filterBox = '';
    this.filterPalletNo = '';
    this.filterUnit = 'CS';
    this.searchFromPA = false;

    this.activeBlock.set('');
    this.activeArch.set('');
    this.activeLine.set('');
    this.activeSku.set('');
    this.activeBox.set('');
    this.activePalletNo.set('');
    this.activeUnit.set('CS');
    this.activeSearchFromPA.set(false);

    this.toastr.info('Search fields reset', 'Info');
  }

  // ── Computed Results ─────────────────────────────────────────────────
  filteredResults = computed(() => {
    const block = this.activeBlock();
    const arch = this.activeArch();
    const line = this.activeLine();
    const sku = this.activeSku();
    const box = this.activeBox();
    const pallet = this.activePalletNo();
    const unit = this.activeUnit();
    const fromPA = this.activeSearchFromPA();

    return this.resultsDataset().filter((item) => {
      if (block && item.block !== block) return false;
      if (arch && item.arch !== arch) return false;
      if (line && item.line !== line) return false;
      if (sku && item.skuCode !== sku) return false;
      if (box && !item.boxName.toLowerCase().includes(box.toLowerCase())) return false;
      if (pallet && !item.currentPallet.toLowerCase().includes(pallet.toLowerCase())) return false;
      if (unit && item.unit !== unit) return false;
      if (fromPA !== item.searchFromPA) return false;
      return true;
    });
  });
}
