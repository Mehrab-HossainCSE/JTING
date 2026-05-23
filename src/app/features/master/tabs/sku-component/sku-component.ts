import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import * as XLSX from 'xlsx';

import { SkuService } from '../../../../core/services/skuServices/sku-service';

import { StorageService } from '../../../../core/services/storage.service';
import { MenuResponse } from '../../../../core/models/MenuResponse';
import { Sku } from '../../../../core/models/setups/sku/sku';

@Component({
  selector: 'app-sku-component',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './sku-component.html',
  styleUrl: './sku-component.scss',
})
export class SkuComponent implements OnInit {
  private skuService = inject(SkuService);
  private fb         = inject(FormBuilder);
  private toastr     = inject(ToastrService);

  protected Math = Math;

  editingSkuId = signal<string | null>(null);
  skuSearch = signal('');
  isLoading = signal(false);
  currentPage = signal(1);
  pageSize    = signal(10);

  skuList = signal<Sku[]>([]);

  skuForm: FormGroup = this.fb.group({
    skucode: ['', [Validators.required]],
    skuname: ['', [Validators.required, Validators.minLength(2)]],
    skucolor: ['#000000', [Validators.required]],
    palletCount: [0, [Validators.required, Validators.min(1)]],
    isESL: [false]
  });

  permissions = signal({
    canView: false,
    canCreate: false,
    canUpdate: false,
    canDelete: false,
  });

  canView = computed(() => this.permissions().canView);
  canCreate = computed(() => this.permissions().canCreate);
  canUpdate = computed(() => this.permissions().canUpdate);
  canDelete = computed(() => this.permissions().canDelete);
  canSave = computed(() => (this.editingSkuId() ? this.canUpdate() : this.canCreate()));

  filteredSkuList = computed(() => {
    const q = this.skuSearch().toLowerCase();
    return this.skuList().filter((s) =>
      s.skucode.toLowerCase().includes(q) ||
      s.skuname.toLowerCase().includes(q)
    );
  });

  totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filteredSkuList().length / this.pageSize()))
  );

  pageNumbers = computed(() =>
    Array.from({ length: this.totalPages() }, (_, i) => i + 1)
  );

  paginatedSkuList = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filteredSkuList().slice(start, start + this.pageSize());
  });

  private storageService = inject(StorageService);

  ngOnInit(): void {
    this.loadPermissionsFromStorage();
    debugger;
    if (this.canView()) {
      this.loadSkus();
    }
  }

  private loadPermissionsFromStorage(): void {
    const menus = this.storageService.getAngularItem<MenuResponse[]>('menus');
    const masterMenu = menus?.find(
      (menu) => menu.name?.toUpperCase() === 'MASTER_SETUP' || menu.url?.toLowerCase() === '/master'
    );
    const currentUrl = '/sku';
    const skuMenu = masterMenu?.children?.find(
      (child) => child.url?.toLowerCase() === currentUrl || child.name?.toUpperCase() === 'SKUS_SETUP'
    );

    if (!skuMenu) {
      this.permissions.set({ canView: false, canCreate: false, canUpdate: false, canDelete: false });
      return;
    }

    this.permissions.set({
      canView: !!skuMenu.canView,
      canCreate: !!skuMenu.canCreate,
      canUpdate: !!skuMenu.canUpdate,
      canDelete: !!skuMenu.canDelete,
    });
  }

  loadSkus(): void {
    this.isLoading.set(true);
    this.skuService.getAll().subscribe({
      next: (res) => {
        if (res.success) {
          this.skuList.set(
            res.data.map((s) => ({
              skucode: s.skucode,
              skuname: s.skuname,
              skucolor: s.skucolor,
              palletCount: s.palletCount,
              isDelete: s.isDelete,
              isESL: s.isESL,
            }))
          );
        } else {
          this.toastr.error(res.message, 'Error');
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        this.toastr.error(err.error?.message || 'Failed to load SKUs.', 'Error');
        this.isLoading.set(false);
      },
    });
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
  }

  onPageSizeChange(value: string): void {
    const size = value === 'all' ? this.filteredSkuList().length || 1 : +value;
    this.pageSize.set(size);
    this.currentPage.set(1);
  }

  onSearchChange(value: string): void {
    this.skuSearch.set(value);
    this.currentPage.set(1);
  }

  resetForm(): void {
    this.skuForm.reset({
      skucode: '',
      skuname: '',
      skucolor: '#000000',
      palletCount: 0,
      isESL: false
    });
    this.skuForm.get('skucode')?.enable();
    this.editingSkuId.set(null);
  }

  isInvalid(field: string): boolean {
    const ctrl = this.skuForm.get(field);
    return !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched));
  }

  getError(field: string): string {
    const ctrl = this.skuForm.get(field);
    if (!ctrl || !ctrl.errors) return '';
    if (ctrl.errors['required'])  return 'This field is required.';
    if (ctrl.errors['minlength']) return `Minimum ${ctrl.errors['minlength'].requiredLength} characters.`;
    if (ctrl.errors['min']) return `Minimum value is ${ctrl.errors['min'].min}.`;
    return '';
  }

  saveSku(): void {
    if (!this.canSave()) {
      return;
    }
    if (this.skuForm.invalid) {
      this.skuForm.markAllAsTouched();
      return;
    }

    const rawValue = this.skuForm.getRawValue();
    const editing = this.editingSkuId();

    if (editing) {
      const payload: Sku = {
        skucode: editing,
        skuname: rawValue.skuname,
        skucolor: rawValue.skucolor.replace('#', ''),
        palletCount: rawValue.palletCount,
        isESL: rawValue.isESL,
        isDelete: false
      };

      this.skuService.update(payload).subscribe({
        next: (res) => {
          if (res.success) {
            this.skuList.update((list) =>
              list.map((s) =>
                s.skucode === editing ? { ...s, ...payload } : s
              )
            );
            this.toastr.success('SKU updated successfully.', 'Success');
            this.resetForm();
            this.loadSkus();
          } else {
            this.toastr.error(res.message, 'Error');
          }
        },
        error: (err) => this.toastr.error(err.error?.message || 'Update failed.', 'Error'),
      });
    } else {
      const payload = {
        skucode: rawValue.skucode,
        skuname: rawValue.skuname,
        skucolor: rawValue.skucolor.replace('#', ''),
        palletCount: rawValue.palletCount,
        isESL: rawValue.isESL,
        isDelete: false
      };

      this.skuService.create(payload).subscribe({
        next: (res) => {
          if (res.success) {
            this.skuList.update((list) => [
              ...list,
              { ...res.data },
            ]);
            this.toastr.success('SKU created successfully.', 'Success');
            this.resetForm();
            this.loadSkus();
          } else {
            this.toastr.error(res.message, 'Error');
          }
        },
        error: (err) => this.toastr.error(err.error?.message || 'Create failed.', 'Error'),
      });
    }
  }

  editSku(item: Sku): void {
    this.editingSkuId.set(item.skucode);
    this.skuForm.setValue({
      skucode: item.skucode,
      skuname: item.skuname,
      skucolor: item.skucolor.startsWith('#') ? item.skucolor : `#${item.skucolor}`,
      palletCount: item.palletCount,
      isESL: item.isESL
    });
    this.skuForm.get('skucode')?.disable(); // Prevent primary key modification
  }

  deleteSku(id: string): void {
    this.skuService.delete(id).subscribe({
      next: (res) => {
        if (res.success) {
          this.skuList.update((list) => list.filter((s) => s.skucode !== id));
          
          if (this.paginatedSkuList().length === 0 && this.currentPage() > 1) {
            this.currentPage.update((p) => p - 1);
          }
          
          this.toastr.success('SKU deleted successfully.', 'Success');
          this.loadSkus(); 
        } else {
          this.toastr.error(res.message, 'Error');
        }
      },
      error: (err) => this.toastr.error(err.error?.message || 'Delete failed.', 'Error'),
    });
  }

  exportToExcel(): void {
    const rows = this.filteredSkuList().map((s) => ({
      'SKU Code':     s.skucode,
      'SKU Name':     s.skuname,
      'SKU Color':    `#${s.skucolor}`,
      'Pallet Count': s.palletCount,
      'Is ESL':       s.isESL ? 'Yes' : 'No',
    }));

    if (!rows.length) return;

    const ws = XLSX.utils.json_to_sheet(rows);
    ws['!cols'] = [{ wch: 15 }, { wch: 30 }, { wch: 15 }, { wch: 15 }, { wch: 10 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'SKUs');
    XLSX.writeFile(wb, 'skus.xlsx');
  }
}