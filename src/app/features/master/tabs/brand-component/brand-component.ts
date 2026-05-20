import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import * as XLSX from 'xlsx';
import { BrandService } from '../../../../core/services/setupServices/brand-service';
import { Brand } from '../../../../core/models/setups/brand/brand';
import { StorageService } from '../../../../core/services/storage.service';
import { MenuResponse } from '../../../../core/models/MenuResponse';

@Component({
  selector: 'app-brand-component',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './brand-component.html',
  styleUrl: './brand-component.scss',
})
export class BrandComponent implements OnInit {
  private brandService = inject(BrandService);
  private fb           = inject(FormBuilder);
  private toastr       = inject(ToastrService);

  protected Math = Math;

  editingBrandId = signal<string | null>(null);
  brandSearch = signal('');
  isLoading = signal(false);
  currentPage = signal(1);
  pageSize    = signal(5);

  brandList = signal<Brand[]>([]);

  brandForm: FormGroup = this.fb.group({
    brandName: ['', [Validators.required, Validators.minLength(2)]],
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
  canSave = computed(() => (this.editingBrandId() ? this.canUpdate() : this.canCreate()));

  filteredBrandList = computed(() => {
    const q = this.brandSearch().toLowerCase();
    return this.brandList().filter((b) =>
      b.brandId.toLowerCase().includes(q) ||
      b.brandName.toLowerCase().includes(q)
    );
  });

  totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filteredBrandList().length / this.pageSize()))
  );

  pageNumbers = computed(() =>
    Array.from({ length: this.totalPages() }, (_, i) => i + 1)
  );

  paginatedBrandList = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filteredBrandList().slice(start, start + this.pageSize());
  });

  private storageService = inject(StorageService);

  ngOnInit(): void {
    this.loadPermissionsFromStorage();
    if (this.canView()) {
      this.loadBrands();
    }
  }

  private loadPermissionsFromStorage(): void {
    const menus = this.storageService.getAngularItem<MenuResponse[]>('menus');
    const masterMenu = menus?.find(
      (menu) => menu.name?.toUpperCase() === 'MASTER_SETUP' || menu.url?.toLowerCase() === '/master'
    );
    const currentUrl = '/brand';
    const brandMenu = masterMenu?.children?.find(
      (child) => child.url?.toLowerCase() === currentUrl || child.name?.toUpperCase() === 'BRAND_SETUP'
    );

    if (!brandMenu) {
      this.permissions.set({ canView: false, canCreate: false, canUpdate: false, canDelete: false });
      return;
    }

    this.permissions.set({
      canView: !!brandMenu.canView,
      canCreate: !!brandMenu.canCreate,
      canUpdate: !!brandMenu.canUpdate,
      canDelete: !!brandMenu.canDelete,
    });
  }

  loadBrands(): void {
    this.isLoading.set(true);
    this.brandService.getAll().subscribe({
      next: (res) => {
        if (res.success) {
          this.brandList.set(
            res.data.map((b) => ({ brandId: b.brandId, brandName: b.brandName }))
          );
        } else {
          this.toastr.error(res.message, 'Error');
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.toastr.error('Failed to load brands.', 'Error');
        this.isLoading.set(false);
      },
    });
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
  }

  onPageSizeChange(value: string): void {
    const size = value === 'all' ? this.filteredBrandList().length || 1 : +value;
    this.pageSize.set(size);
    this.currentPage.set(1);
  }

  onSearchChange(value: string): void {
    this.brandSearch.set(value);
    this.currentPage.set(1);
  }

  resetForm(): void {
    this.brandForm.reset();
    this.editingBrandId.set(null);
  }

  isInvalid(field: string): boolean {
    const ctrl = this.brandForm.get(field);
    return !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched));
  }

  getError(field: string): string {
    const ctrl = this.brandForm.get(field);
    if (!ctrl || !ctrl.errors) return '';
    if (ctrl.errors['required'])  return 'This field is required.';
    if (ctrl.errors['minlength']) return `Minimum ${ctrl.errors['minlength'].requiredLength} characters.`;
    return '';
  }

  saveBrand(): void {
    if (!this.canSave()) {
      return;
    }
    if (this.brandForm.invalid) {
      this.brandForm.markAllAsTouched();
      return;
    }

    const { brandName } = this.brandForm.getRawValue();
    const editing = this.editingBrandId();

    if (editing) {
      const payload: Brand = { brandId: editing, brandName };

      this.brandService.update(payload).subscribe({ 
        next: (res) => {
          if (res.success) {
            this.brandList.update((list) =>
              list.map((b) =>
                b.brandId === editing ? { brandId: b.brandId, brandName } : b
              )
            );
            this.toastr.success('Brand updated successfully.', 'Success');
            this.resetForm();
            this.loadBrands(); 
          } else {
            this.toastr.error(res.message, 'Error');
          }
        },
        error: () => this.toastr.error('Update failed.', 'Error'),
      });
    } else {
      const payload = { brandName };

      this.brandService.create(payload).subscribe({
        next: (res) => {
          if (res.success) {
            this.brandList.update((list) => [
              ...list,
              { brandId: res.data.brandId, brandName: res.data.brandName },
            ]);
            this.toastr.success('Brand created successfully.', 'Success');
            this.resetForm();
            this.loadBrands();
          } else {
            this.toastr.error(res.message, 'Error');
          }
        },
        error: () => this.toastr.error('Create failed.', 'Error'),
      });
    }
  }

  editBrand(item: Brand): void {
    debugger;
    this.editingBrandId.set(item.brandId);
    this.brandForm.setValue({ brandName: item.brandName });
  }

  deleteBrand(id: string): void {
    this.brandService.delete(id).subscribe({
      next: (res) => {
        if (res.success) {
          this.brandList.update((list) => list.filter((b) => b.brandId !== id));
          if (this.paginatedBrandList().length === 0 && this.currentPage() > 1) {
            this.currentPage.update((p) => p - 1);
          }
          this.toastr.success('Brand deleted successfully.', 'Success');
          this.loadBrands(); 
        } else {
          this.toastr.error(res.message, 'Error');
        }
      },
      error: () => this.toastr.error('Delete failed.', 'Error'),
    });
  }

  exportToExcel(): void {
    const rows = this.filteredBrandList().map((b) => ({
      'Brand ID':   b.brandId,
      'Brand Name': b.brandName,
    }));

    if (!rows.length) return;

    const ws = XLSX.utils.json_to_sheet(rows);
    ws['!cols'] = [{ wch: 16 }, { wch: 24 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Brands');
    XLSX.writeFile(wb, 'brands.xlsx');
  }
}