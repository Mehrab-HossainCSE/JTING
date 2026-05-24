import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import * as XLSX from 'xlsx';

import { ExternalSubBrandService } from '../../../../core/services/setupServices/external-sub-brand.service';
import { ExternalBranchService } from '../../../../core/services/setupServices/external-branch-service';
import { ExternalBrand } from '../../../../core/models/setups/extarnalBrand/external-brand';
import { StorageService } from '../../../../core/services/storage.service';
import { MenuResponse } from '../../../../core/models/MenuResponse';
import { ExternalSubBrand } from '../../../../core/models/setups/externalSubBrand/external-sub-brand';
import { StaticData } from '../../../../core/services/static-data';

@Component({
  selector: 'app-external-sub-brand-component',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './external-sub-brand-component.html',
  styleUrl: './external-sub-brand-component.scss',
})
export class ExternalSubBrandComponent implements OnInit {
  private externalSubBrandService = inject(ExternalSubBrandService);
  private externalBrandService    = inject(ExternalBranchService);
  private fb                      = inject(FormBuilder);
  private toastr                  = inject(ToastrService);
  private storageService          = inject(StorageService);

  protected Math = Math;

  editingAutoId = signal<number | null>(null);
  searchQuery = signal('');
  isLoading = signal(false);
  currentPage = signal(1);
  pageSize    = signal(StaticData.PAGE_SIZE);

  extSubBrandList = signal<ExternalSubBrand[]>([]);
  extBrandList = signal<ExternalBrand[]>([]);

  extSubBrandForm: FormGroup = this.fb.group({
    extBrandId: ['', [Validators.required]],
    extSubBrandId: ['', [Validators.required]],
    extSubBrandName: ['', [Validators.required, Validators.minLength(2)]],
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
  canSave = computed(() => (this.editingAutoId() ? this.canUpdate() : this.canCreate()));

  getBrandName(extBrandId: string): string {
    const brand = this.extBrandList().find(b => b.extBrandId === extBrandId);
    return brand ? brand.extBrandName : extBrandId;
  }

  filteredList = computed(() => {
    const q = this.searchQuery().toLowerCase();
    return this.extSubBrandList().filter((sb) =>
      sb.extSubBrandId.toLowerCase().includes(q) ||
      sb.extSubBrandName.toLowerCase().includes(q) ||
      this.getBrandName(sb.extBrandId).toLowerCase().includes(q)
    );
  });

  totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filteredList().length / this.pageSize()))
  );

  pageNumbers = computed(() =>
    Array.from({ length: this.totalPages() }, (_, i) => i + 1)
  );

  paginatedList = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filteredList().slice(start, start + this.pageSize());
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
    const currentUrl = '/external-sub-brand';
    const subBrandMenu = masterMenu?.children?.find(
      (child) => child.url?.toLowerCase() === currentUrl || child.name?.toUpperCase() === 'EXTERNAL_SUB_BRAND_SETUP'
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
    this.externalBrandService.getAll().subscribe({
      next: (res) => {
        if (res.success) {
          this.extBrandList.set(res.data);
          this.loadExternalSubBrands();
        } else {
          this.toastr.error('Failed to load external brands.', 'Error');
          this.isLoading.set(false);
        }
      },
      error: () => {
        this.toastr.error('Failed to load external brands.', 'Error');
        this.isLoading.set(false);
      }
    });
  }

  loadExternalSubBrands(): void {
    this.externalSubBrandService.getAll().subscribe({
      next: (res) => {
        if (res.success) {
          this.extSubBrandList.set(res.data);
        } else {
          this.toastr.error(res.message, 'Error');
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.toastr.error('Failed to load external sub brands.', 'Error');
        this.isLoading.set(false);
      },
    });
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
  }

  onPageSizeChange(value: string): void {
    const size = value === 'all' ? this.filteredList().length || 1 : +value;
    this.pageSize.set(size);
    this.currentPage.set(1);
  }

  onSearchChange(value: string): void {
    this.searchQuery.set(value);
    this.currentPage.set(1);
  }

  resetForm(): void {
    this.extSubBrandForm.reset({ extBrandId: '' });
    this.editingAutoId.set(null);
  }

  isInvalid(field: string): boolean {
    const ctrl = this.extSubBrandForm.get(field);
    return !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched));
  }

  getError(field: string): string {
    const ctrl = this.extSubBrandForm.get(field);
    if (!ctrl || !ctrl.errors) return '';
    if (ctrl.errors['required'])  return 'This field is required.';
    if (ctrl.errors['minlength']) return `Minimum ${ctrl.errors['minlength'].requiredLength} characters.`;
    return '';
  }

  saveExtSubBrand(): void {
    if (!this.canSave()) return;
    if (this.extSubBrandForm.invalid) {
      this.extSubBrandForm.markAllAsTouched();
      return;
    }

    const payload = this.extSubBrandForm.getRawValue();
    const editingId = this.editingAutoId();
    
    const request$ = editingId 
      ? this.externalSubBrandService.update({ autoId: editingId, ...payload })
      : this.externalSubBrandService.create(payload);

    request$.subscribe({
      next: (res) => {
        if (res.success) {
          this.toastr.success(`External Sub Brand ${editingId ? 'updated' : 'created'} successfully.`, 'Success');
          this.resetForm();
          this.loadExternalSubBrands();
        } else {
          this.toastr.error(res.message, 'Error');
        }
      },
      error: (err) => this.toastr.error(err.error?.message || 'Operation failed.', 'Error'),
    });
  }

  editExtSubBrand(item: ExternalSubBrand): void {
    this.editingAutoId.set(item.autoId);
    this.extSubBrandForm.setValue({
      extBrandId: item.extBrandId,
      extSubBrandId: item.extSubBrandId,
      extSubBrandName: item.extSubBrandName
    });
  }

  deleteExtSubBrand(id: number): void {
    this.externalSubBrandService.delete(id).subscribe({
      next: (res) => {
        if (res.success) {
          this.extSubBrandList.update((list) => list.filter((sb) => sb.autoId !== id));
          if (this.paginatedList().length === 0 && this.currentPage() > 1) {
            this.currentPage.update((p) => p - 1);
          }
          this.toastr.success('External Sub Brand deleted successfully.', 'Success');
          this.loadExternalSubBrands(); 
        } else {
          this.toastr.error(res.message, 'Error');
        }
      },
      error: (err) => this.toastr.error(err.error?.message || 'Delete failed.', 'Error'),
    });
  }

  exportToExcel(): void {
    const rows = this.filteredList().map((sb) => ({
      'Auto ID':           sb.autoId,
      'External Brand':    this.getBrandName(sb.extBrandId),
      'Sub Brand ID No':   sb.extSubBrandId,
      'Sub Brand Name':    sb.extSubBrandName,
    }));

    if (!rows.length) return;

    const ws = XLSX.utils.json_to_sheet(rows);
    ws['!cols'] = [{ wch: 10 }, { wch: 24 }, { wch: 16 }, { wch: 24 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'ExternalSubBrands');
    XLSX.writeFile(wb, 'external-sub-brands.xlsx');
  }
}