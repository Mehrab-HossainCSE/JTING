import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { StorageService } from '../../../../core/services/storage.service';
import { MenuResponse } from '../../../../core/models/MenuResponse';

@Component({
  selector: 'app-barcode-generation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './barcode-generation.html',
  styleUrl: './barcode-generation.scss',
})
export class BarcodeGeneration implements OnInit {
  private toastr         = inject(ToastrService);
  private storageService = inject(StorageService);

  // ── Permissions ──────────────────────────────────────────────────────
  permissions = signal({
    canView: true,     // Default to true for hardcoded design
    canCreate: true,
    canUpdate: true,
    canDelete: true,
  });

  canView = computed(() => this.permissions().canView);
  canCreate = computed(() => this.permissions().canCreate);

  // ── Mock Dropdown Data ────────────────────────────────────────────────
  brands: string[] = ['Marlboro', 'Winston', 'Camel', 'Mevius', 'LD', 'Sobranie'];
  
  subBrandsMap: Record<string, string[]> = {
    'Marlboro': ['Marlboro Red', 'Marlboro Gold'],
    'Winston': ['Winston Blue', 'Winston Silver'],
    'Camel': ['Camel Light', 'Camel Yellow'],
    'Mevius': ['Mevius Original', 'Mevius Menthol'],
    'LD': ['LD Red', 'LD Blue'],
    'Sobranie': ['Sobranie Black', 'Sobranie Classic'],
  };

  // ── Form State Signals ────────────────────────────────────────────────
  selectedBrand = signal('');
  selectedSubBrand = signal('');
  noOfCarton = signal<number | null>(null);
  barcodeQty = signal<number | null>(null);

  // ── Cascading Sub-Brands ──────────────────────────────────────────────
  filteredSubBrands = computed(() => {
    const brand = this.selectedBrand();
    if (!brand) return [];
    return this.subBrandsMap[brand] || [];
  });

  onBrandChange(): void {
    this.selectedSubBrand.set('');
  }

  // ── Computeds for Preview Card ───────────────────────────────────────
  previewBrand = computed(() => this.selectedBrand() || '—');
  previewSubBrand = computed(() => this.selectedSubBrand() || '—');
  previewCartons = computed(() => this.noOfCarton() !== null ? this.noOfCarton() : '—');
  previewQty = computed(() => this.barcodeQty() !== null ? this.barcodeQty() : '—');

  // ── Lifecycle ────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.loadPermissionsFromStorage();
  }

  private loadPermissionsFromStorage(): void {
    const menus = this.storageService.getAngularItem<MenuResponse[]>('menus');
    const parentMenu = menus?.find(
      (m) => m.name?.toUpperCase() === 'RECEIVE_MODULE' || m.url?.toLowerCase() === '/receive'
    );
    const bMenu = parentMenu?.children?.find(
      (c) =>
        c.url?.toLowerCase() === '/barcode-generation' ||
        c.name?.toUpperCase() === 'BARCODE_GENERATION'
    );

    if (bMenu) {
      this.permissions.set({
        canView:   !!bMenu.canView,
        canCreate: !!bMenu.canCreate,
        canUpdate: !!bMenu.canUpdate,
        canDelete: !!bMenu.canDelete,
      });
    }
  }

  // ── Actions ──────────────────────────────────────────────────────────
  isValidForm(): boolean {
    return (
      !!this.selectedBrand() &&
      !!this.selectedSubBrand() &&
      this.noOfCarton() !== null &&
      this.noOfCarton()! > 0 &&
      this.barcodeQty() !== null &&
      this.barcodeQty()! > 0
    );
  }

  saveAndPrint(): void {
    if (!this.canCreate()) {
      this.toastr.error('You do not have permission to generate barcodes.', 'Access Denied');
      return;
    }

    if (!this.isValidForm()) {
      this.toastr.warning('Please fill in all form fields with valid values.', 'Warning');
      return;
    }

    this.toastr.success(
      `Generated ${this.barcodeQty()} barcodes successfully for ${this.selectedSubBrand()}!`,
      'Success'
    );
    this.clearForm();
  }

  clearForm(): void {
    this.selectedBrand.set('');
    this.selectedSubBrand.set('');
    this.noOfCarton.set(null);
    this.barcodeQty.set(null);
  }

  close(): void {
    this.clearForm();
    this.toastr.info('Inputs cleared', 'Cleared');
  }
}
