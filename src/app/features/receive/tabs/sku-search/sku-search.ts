import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { StorageService } from '../../../../core/services/storage.service';
import { MenuResponse } from '../../../../core/models/MenuResponse';
import { BlockService } from '../../../../core/services/setupServices/block-service';
import { ArchService } from '../../../../core/services/setupServices/arch-service';
import { LineService } from '../../../../core/services/setupServices/line-service';
import { SkuService } from '../../../../core/services/skuServices/sku-service';
import { SkuSearchRequest, SkuSearchResult } from '../../../../core/models/setups/sku/sku-search';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';
import { Sku } from '../../../../core/models/setups/sku/sku';
import { SkuSetting } from '../../../../core/models/setups/sku/sku-setting';
import { Block } from '../../../../core/models/setups/block/block';
import { Arch } from '../../../../core/models/setups/arch/arch';
import { Line } from '../../../../core/models/setups/line/line';

@Component({
  selector: 'app-sku-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sku-search.html',
  styleUrl: './sku-search.scss',
})
export class SkuSearch implements OnInit {
  private toastr = inject(ToastrService);
  private storageService = inject(StorageService);

  private blockService = inject(BlockService);
  private archService = inject(ArchService);
  private lineService = inject(LineService);
  private skuService = inject(SkuService);
  private errorHandler = inject(ErrorHandlerService);

  // ── Permissions ──────────────────────────────────────────────────────
  permissions = signal({
    canView: true,     // Default to true for design showcase
    canCreate: true,
    canUpdate: true,
    canDelete: true,
  });

  canView = computed(() => this.permissions().canView);

  // ── Dropdown Option Signals ──────────────────────────────────────────
  blocks = signal<Block[]>([]);
  arches = signal<Arch[]>([]);
  lines = signal<Line[]>([]);
  skus = signal<Sku[]>([]);
  units = signal<SkuSetting[]>([]);

  // ── Search State ─────────────────────────────────────────────────────
  filterBlock = '';
  filterArch = '';
  filterLine = '';
  filterSku = '';
  filterBox = '';
  filterPalletNo = '';
  filterUnit = '';
  searchFromPA = false;

  // ── Complete Dataset ────────────────────────────────────────────
  resultsDataset = signal<SkuSearchResult[]>([]);

  // ── Lifecycle ────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.loadPermissionsFromStorage();
    this.loadBlocks();
    this.loadSkus();
    this.loadUnits();
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
        canView: !!sMenu.canView,
        canCreate: !!sMenu.canCreate,
        canUpdate: !!sMenu.canUpdate,
        canDelete: !!sMenu.canDelete,
      });
    }
  }

  // ── API Options Loading ──────────────────────────────────────────────
  loadBlocks(): void {
    this.blockService.getAll().subscribe({
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

  loadSkus(): void {
    debugger;
    this.skuService.getAll().subscribe({
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

  loadUnits(): void {
    this.skuService.getSetting().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.units.set(res.data);
          if (res.data.length > 0) {
            this.filterUnit = res.data[0].name;
          }
        } else {
          this.toastr.error(res.message || 'Failed to load settings', 'Error');
        }
      },
      error: (err) => {
        this.errorHandler.handleErrorWithToster(err);
      }
    });
  }

  // ── Cascading Dropdowns ──────────────────────────────────────────────
  onBlockChange(): void {
    this.filterArch = '';
    this.filterLine = '';
    this.arches.set([]);
    this.lines.set([]);

    if (this.filterBlock) {
      this.archService.getByBlockId(this.filterBlock).subscribe({
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
      this.lineService.getByArchId(this.filterArch).subscribe({
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

  // ── Handlers ─────────────────────────────────────────────────────────
  search(): void {
    const selectedUnit = this.units().find(u => u.name === this.filterUnit);
    const settingQty = selectedUnit ? selectedUnit.qty.toString() : '0';

    const payload: SkuSearchRequest = {
      blockId: this.filterBlock || 'All',
      archId: this.filterArch || 'All',
      lineId: this.filterLine || 'All',
      skuCode: this.filterSku || 'All',
      boxName: this.filterBox.trim() || '',
      palletNo: this.filterPalletNo.trim() || null,
      settingQty: settingQty,
      isPa: this.searchFromPA
    };

    this.skuService.getSkuBySearchData(payload).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.resultsDataset.set(res.data);
          this.toastr.success(res.message || 'Search completed', 'Success');
        } else {
          this.resultsDataset.set([]);
          this.toastr.error(res.message || 'No records found', 'Error');
        }
      },
      error: (err) => {
        this.errorHandler.handleErrorWithToster(err);
      }
    });
  }

  resetInput(): void {
    this.filterBlock = '';
    this.filterArch = '';
    this.filterLine = '';
    this.filterSku = '';
    this.filterBox = '';
    this.filterPalletNo = '';
    this.filterUnit = this.units().length > 0 ? this.units()[0].name : '';
    this.searchFromPA = false;

    this.arches.set([]);
    this.lines.set([]);
    this.resultsDataset.set([]);
    this.toastr.info('Search fields reset', 'Info');
  }

  // ── Computed Results ─────────────────────────────────────────────────
  filteredResults = computed(() => this.resultsDataset());
}
