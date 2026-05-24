import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import * as XLSX from 'xlsx';

import { ExternalBranchService } from '../../../../core/services/setupServices/external-branch-service';
import { StorageService } from '../../../../core/services/storage.service';
import { MenuResponse } from '../../../../core/models/MenuResponse';
import { ExternalBrand } from '../../../../core/models/setups/extarnalBrand/external-brand';
import { StaticData } from '../../../../core/services/static-data';

@Component({
  selector: 'app-external-brand-component',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './external-brand-component.html',
  styleUrl: './external-brand-component.scss',
})
export class ExternalBrandComponent implements OnInit {
  private externalBrandService = inject(ExternalBranchService);
  private fb                   = inject(FormBuilder);
  private toastr               = inject(ToastrService);
  private storageService       = inject(StorageService);

  protected Math = Math;

  editingExtBrandId = signal<string | null>(null);
  extBrandSearch = signal('');
  isLoading = signal(false);
  currentPage = signal(1);
  pageSize    = signal(StaticData.PAGE_SIZE);

  extBrandList = signal<ExternalBrand[]>([]);

  extBrandForm: FormGroup = this.fb.group({
    extBrandName: ['', [Validators.required, Validators.minLength(2)]],
    isActive: [true]
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
  canSave = computed(() => (this.editingExtBrandId() ? this.canUpdate() : this.canCreate()));

  filteredExtBrandList = computed(() => {
    const q = this.extBrandSearch().toLowerCase();
    return this.extBrandList().filter((eb) =>
      eb.extBrandId.toLowerCase().includes(q) ||
      eb.extBrandName.toLowerCase().includes(q)
    );
  });

  totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filteredExtBrandList().length / this.pageSize()))
  );

  pageNumbers = computed(() =>
    Array.from({ length: this.totalPages() }, (_, i) => i + 1)
  );

  paginatedExtBrandList = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filteredExtBrandList().slice(start, start + this.pageSize());
  });

  ngOnInit(): void {
    this.loadPermissionsFromStorage();
    if (this.canView()) {
      this.loadExternalBrands();
    }
  }

  private loadPermissionsFromStorage(): void {
    const menus = this.storageService.getAngularItem<MenuResponse[]>('menus');
    const masterMenu = menus?.find(
      (menu) => menu.name?.toUpperCase() === 'MASTER_SETUP' || menu.url?.toLowerCase() === '/master'
    );
    const currentUrl = '/external-brand';
    const extBrandMenu = masterMenu?.children?.find(
      (child) => child.url?.toLowerCase() === currentUrl || child.name?.toUpperCase() === 'EXTERNAL_BRAND_SETUP'
    );

    if (!extBrandMenu) {
      this.permissions.set({ canView: false, canCreate: false, canUpdate: false, canDelete: false });
      return;
    }

    this.permissions.set({
      canView: !!extBrandMenu.canView,
      canCreate: !!extBrandMenu.canCreate,
      canUpdate: !!extBrandMenu.canUpdate,
      canDelete: !!extBrandMenu.canDelete,
    });
  }

  loadExternalBrands(): void {
    this.isLoading.set(true);
    this.externalBrandService.getAll().subscribe({
      next: (res) => {
        if (res.success) {
          this.extBrandList.set(res.data);
        } else {
          this.toastr.error(res.message, 'Error');
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.toastr.error('Failed to load external brands.', 'Error');
        this.isLoading.set(false);
      },
    });
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
  }

  onPageSizeChange(value: string): void {
    const size = value === 'all' ? this.filteredExtBrandList().length || 1 : +value;
    this.pageSize.set(size);
    this.currentPage.set(1);
  }

  onSearchChange(value: string): void {
    this.extBrandSearch.set(value);
    this.currentPage.set(1);
  }

  resetForm(): void {
    this.extBrandForm.reset({ isActive: true });
    this.editingExtBrandId.set(null);
  }

  isInvalid(field: string): boolean {
    const ctrl = this.extBrandForm.get(field);
    return !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched));
  }

  getError(field: string): string {
    const ctrl = this.extBrandForm.get(field);
    if (!ctrl || !ctrl.errors) return '';
    if (ctrl.errors['required'])  return 'This field is required.';
    if (ctrl.errors['minlength']) return `Minimum ${ctrl.errors['minlength'].requiredLength} characters.`;
    return '';
  }

  saveExtBrand(): void {
    if (!this.canSave()) return;
    if (this.extBrandForm.invalid) {
      this.extBrandForm.markAllAsTouched();
      return;
    }

    const payload = this.extBrandForm.getRawValue();
    const editing = this.editingExtBrandId();
    const request$ = editing 
      ? this.externalBrandService.update({ extBrandId: editing, ...payload })
      : this.externalBrandService.create(payload);

    request$.subscribe({
      next: (res) => {
        if (res.success) {
          this.toastr.success(`External Brand ${editing ? 'updated' : 'created'} successfully.`, 'Success');
          this.resetForm();
          this.loadExternalBrands();
        } else {
          this.toastr.error(res.message, 'Error');
        }
      },
      error: (err) => this.toastr.error(err.error?.message || 'Operation failed.', 'Error'),
    });
  }

  editExtBrand(item: ExternalBrand): void {
    this.editingExtBrandId.set(item.extBrandId);
    this.extBrandForm.setValue({ 
      extBrandName: item.extBrandName, 
      isActive: item.isActive 
    });
  }

  deleteExtBrand(id: string): void {
    this.externalBrandService.delete(id).subscribe({
      next: (res) => {
        if (res.success) {
          this.extBrandList.update((list) => list.filter((eb) => eb.extBrandId !== id));
          if (this.paginatedExtBrandList().length === 0 && this.currentPage() > 1) {
            this.currentPage.update((p) => p - 1);
          }
          this.toastr.success('External Brand deleted successfully.', 'Success');
          this.loadExternalBrands(); 
        } else {
          this.toastr.error(res.message, 'Error');
        }
      },
      error: (err) => this.toastr.error(err.error?.message || 'Delete failed.', 'Error'),
    });
  }

  exportToExcel(): void {
    const rows = this.filteredExtBrandList().map((eb) => ({
      'External Brand ID':   eb.extBrandId,
      'External Brand Name': eb.extBrandName,
      'Status':              eb.isActive ? 'Active' : 'Inactive',
    }));

    if (!rows.length) return;

    const ws = XLSX.utils.json_to_sheet(rows);
    ws['!cols'] = [{ wch: 20 }, { wch: 30 }, { wch: 15 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'ExternalBrands');
    XLSX.writeFile(wb, 'external-brands.xlsx');
  }
}