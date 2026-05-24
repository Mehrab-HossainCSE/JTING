import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import * as XLSX from 'xlsx';

import { SubBrandService } from '../../../../core/services/setupServices/sub-brand.service';
import { BrandService } from '../../../../core/services/setupServices/brand-service';
import { Brand } from '../../../../core/models/setups/brand/brand';
import { StorageService } from '../../../../core/services/storage.service';
import { MenuResponse } from '../../../../core/models/MenuResponse';
import { SubBrand } from '../../../../core/models/setups/subBrand/sub-brand';
import { StaticData } from '../../../../core/services/static-data';

@Component({
  selector: 'app-sub-brand-component',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './sub-brand-component.html',
  styleUrl: './sub-brand-component.scss',
})
export class SubBrandComponent implements OnInit {
  private subBrandService = inject(SubBrandService);
  private brandService    = inject(BrandService);
  private fb              = inject(FormBuilder);
  private toastr          = inject(ToastrService);
  private storageService  = inject(StorageService);

  protected Math = Math;

  editingSubBrandId = signal<string | null>(null);
  subBrandSearch = signal('');
  isLoading = signal(false);
  currentPage = signal(1);
  pageSize    = signal(StaticData.PAGE_SIZE);

  subBrandList = signal<SubBrand[]>([]);
  brandList = signal<Brand[]>([]); // Used for the brand dropdown

  subBrandForm: FormGroup = this.fb.group({
    brandId: ['', [Validators.required]],
    subBrandName: ['', [Validators.required, Validators.minLength(2)]],
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
  canSave = computed(() => (this.editingSubBrandId() ? this.canUpdate() : this.canCreate()));

  getBrandName(brandId: string): string {
    const brand = this.brandList().find(b => b.brandId === brandId);
    return brand ? brand.brandName : brandId;
  }

  filteredSubBrandList = computed(() => {
    const q = this.subBrandSearch().toLowerCase();
    return this.subBrandList().filter((sb) =>
      sb.subBrandId.toLowerCase().includes(q) ||
      sb.subBrandName.toLowerCase().includes(q) ||
      this.getBrandName(sb.brandId).toLowerCase().includes(q)
    );
  });

  totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filteredSubBrandList().length / this.pageSize()))
  );

  pageNumbers = computed(() =>
    Array.from({ length: this.totalPages() }, (_, i) => i + 1)
  );

  paginatedSubBrandList = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filteredSubBrandList().slice(start, start + this.pageSize());
  });

  ngOnInit(): void {
    this.loadPermissionsFromStorage();
    if (this.canView()) {
      this.loadInitialData();
    }
  }

  private loadPermissionsFromStorage(): void {
    const menus = this.storageService.getAngularItem<MenuResponse[]>('menus');
    const masterMenu = menus?.find(
      (menu) => menu.name?.toUpperCase() === 'MASTER_SETUP' || menu.url?.toLowerCase() === '/master'
    );
    const currentUrl = '/sub-brand';
    const subBrandMenu = masterMenu?.children?.find(
      (child) => child.url?.toLowerCase() === currentUrl || child.name?.toUpperCase() === 'SUB_BRAND_SETUP'
    );

    if (!subBrandMenu) {
      this.permissions.set({ canView: false, canCreate: false, canUpdate: false, canDelete: false });
      return;
    }

    this.permissions.set({
      canView: !!subBrandMenu.canView,
      canCreate: !!subBrandMenu.canCreate,
      canUpdate: !!subBrandMenu.canUpdate,
      canDelete: !!subBrandMenu.canDelete,
    });
  }

  loadInitialData(): void {
    this.isLoading.set(true);
    this.brandService.getAll().subscribe({
      next: (res) => {
        if (res.success) {
          this.brandList.set(res.data);
          this.loadSubBrands();
        } else {
          this.toastr.error('Failed to load brands.', 'Error');
          this.isLoading.set(false);
        }
      },
      error: () => {
        this.toastr.error('Failed to load brands.', 'Error');
        this.isLoading.set(false);
      }
    });
  }

  loadSubBrands(): void {
    this.subBrandService.getAll().subscribe({
      next: (res) => {
        if (res.success) {
          this.subBrandList.set(res.data.map((sb) => ({ 
            subBrandId: sb.subBrandId, 
            brandId: sb.brandId, 
            subBrandName: sb.subBrandName 
          })));
        } else {
          this.toastr.error(res.message, 'Error');
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.toastr.error('Failed to load sub brands.', 'Error');
        this.isLoading.set(false);
      },
    });
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
  }

  onPageSizeChange(value: string): void {
    const size = value === 'all' ? this.filteredSubBrandList().length || 1 : +value;
    this.pageSize.set(size);
    this.currentPage.set(1);
  }

  onSearchChange(value: string): void {
    this.subBrandSearch.set(value);
    this.currentPage.set(1);
  }

  resetForm(): void {
    this.subBrandForm.reset({ brandId: '' });
    this.editingSubBrandId.set(null);
  }

  isInvalid(field: string): boolean {
    const ctrl = this.subBrandForm.get(field);
    return !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched));
  }

  getError(field: string): string {
    const ctrl = this.subBrandForm.get(field);
    if (!ctrl || !ctrl.errors) return '';
    if (ctrl.errors['required'])  return 'This field is required.';
    if (ctrl.errors['minlength']) return `Minimum ${ctrl.errors['minlength'].requiredLength} characters.`;
    return '';
  }

  saveSubBrand(): void {
    if (!this.canSave()) {
      return;
    }
    if (this.subBrandForm.invalid) {
      this.subBrandForm.markAllAsTouched();
      return;
    }

    const { brandId, subBrandName } = this.subBrandForm.getRawValue();
    const editing = this.editingSubBrandId();

    if (editing) {
      const payload: SubBrand = { subBrandId: editing, brandId, subBrandName };

      this.subBrandService.update(payload).subscribe({ 
        next: (res) => {
          if (res.success) {
            this.subBrandList.update((list) =>
              list.map((sb) =>
                sb.subBrandId === editing ? { subBrandId: sb.subBrandId, brandId, subBrandName } : sb
              )
            );
            this.toastr.success('Sub Brand updated successfully.', 'Success');
            this.resetForm();
            this.loadSubBrands(); 
          } else {
            this.toastr.error(res.message, 'Error');
          }
        },
        error: (err) => this.toastr.error(err.error?.message || 'Update failed.', 'Error'),
      });
    } else {
      const payload = { brandId, subBrandName };

      this.subBrandService.create(payload).subscribe({
        next: (res) => {
          if (res.success) {
            this.subBrandList.update((list) => [
              ...list,
              { subBrandId: res.data.subBrandId, brandId: res.data.brandId, subBrandName: res.data.subBrandName },
            ]);
            this.toastr.success('Sub Brand created successfully.', 'Success');
            this.resetForm();
            this.loadSubBrands();
          } else {
            this.toastr.error(res.message, 'Error');
          }
        },
        error: (err) => this.toastr.error(err.error?.message || 'Create failed.', 'Error'),
      });
    }
  }

  editSubBrand(item: SubBrand): void {
    this.editingSubBrandId.set(item.subBrandId);
    this.subBrandForm.setValue({ brandId: item.brandId, subBrandName: item.subBrandName });
  }

  deleteSubBrand(id: string): void {
    this.subBrandService.delete(id).subscribe({
      next: (res) => {
        if (res.success) {
          this.subBrandList.update((list) => list.filter((sb) => sb.subBrandId !== id));
          if (this.paginatedSubBrandList().length === 0 && this.currentPage() > 1) {
            this.currentPage.update((p) => p - 1);
          }
          this.toastr.success('Sub Brand deleted successfully.', 'Success');
          this.loadSubBrands(); 
        } else {
          this.toastr.error(res.message, 'Error');
        }
      },
      error: (err) => this.toastr.error(err.error?.message || 'Delete failed.', 'Error'),
    });
  }

  exportToExcel(): void {
    const rows = this.filteredSubBrandList().map((sb) => ({
      'Sub Brand ID':   sb.subBrandId,
      'Brand':          this.getBrandName(sb.brandId),
      'Sub Brand Name': sb.subBrandName,
    }));

    if (!rows.length) return;

    const ws = XLSX.utils.json_to_sheet(rows);
    ws['!cols'] = [{ wch: 16 }, { wch: 24 }, { wch: 24 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'SubBrands');
    XLSX.writeFile(wb, 'sub-brands.xlsx');
  }
}