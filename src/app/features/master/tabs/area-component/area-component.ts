import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import * as XLSX from 'xlsx';

import { AreaService } from '../../../../core/services/setupServices/area-service';
import { Area } from '../../../../core/models/setups/area/area';
import { StorageService } from '../../../../core/services/storage.service';
import { MenuResponse } from '../../../../core/models/MenuResponse';
import { StaticData } from '../../../../core/services/static-data';

@Component({
  selector: 'app-area-component',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './area-component.html',
  styleUrl: './area-component.scss',
})
export class AreaComponent implements OnInit {
  private areaService    = inject(AreaService);
  private fb             = inject(FormBuilder);
  private toastr         = inject(ToastrService);
  private storageService = inject(StorageService);

  protected Math = Math;

  editingAreaId = signal<number | null>(null);
  areaSearch = signal('');
  isLoading = signal(false);
  currentPage = signal(1);
  pageSize    = signal(StaticData.PAGE_SIZE);

  areaList = signal<Area[]>([]);

  areaForm: FormGroup = this.fb.group({
    areaName: ['', [Validators.required, Validators.minLength(2)]],
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
  canSave = computed(() => (this.editingAreaId() ? this.canUpdate() : this.canCreate()));

  filteredAreaList = computed(() => {
    const q = this.areaSearch().toLowerCase();
    return this.areaList().filter((a) =>
      a.id.toString().includes(q) ||
      a.areaName.toLowerCase().includes(q)
    );
  });

  totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filteredAreaList().length / this.pageSize()))
  );

  pageNumbers = computed(() =>
    Array.from({ length: this.totalPages() }, (_, i) => i + 1)
  );

  paginatedAreaList = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filteredAreaList().slice(start, start + this.pageSize());
  });

  ngOnInit(): void {
    this.loadPermissionsFromStorage();
    if (this.canView()) {
      this.loadAreas();
    }
  }

  private loadPermissionsFromStorage(): void {
    const menus = this.storageService.getAngularItem<MenuResponse[]>('menus');
    const masterMenu = menus?.find(
      (menu) => menu.name?.toUpperCase() === 'MASTER_SETUP' || menu.url?.toLowerCase() === '/master'
    );
    const currentUrl = '/area';
    const areaMenu = masterMenu?.children?.find(
      (child) => child.url?.toLowerCase() === currentUrl || child.name?.toUpperCase() === 'AREA_SETUP'
    );

    if (!areaMenu) {
      this.permissions.set({ canView: false, canCreate: false, canUpdate: false, canDelete: false });
      return;
    }

    this.permissions.set({
      canView: !!areaMenu.canView,
      canCreate: !!areaMenu.canCreate,
      canUpdate: !!areaMenu.canUpdate,
      canDelete: !!areaMenu.canDelete,
    });
  }

  loadAreas(): void {
    this.isLoading.set(true);
    this.areaService.getAll().subscribe({
      next: (res) => {
        if (res.success) {
          this.areaList.set(res.data);
        } else {
          this.toastr.error(res.message, 'Error');
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.toastr.error('Failed to load areas.', 'Error');
        this.isLoading.set(false);
      },
    });
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
  }

  onPageSizeChange(value: string): void {
    const size = value === 'all' ? this.filteredAreaList().length || 1 : +value;
    this.pageSize.set(size);
    this.currentPage.set(1);
  }

  onSearchChange(value: string): void {
    this.areaSearch.set(value);
    this.currentPage.set(1);
  }

  resetForm(): void {
    this.areaForm.reset();
    this.editingAreaId.set(null);
  }

  isInvalid(field: string): boolean {
    const ctrl = this.areaForm.get(field);
    return !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched));
  }

  getError(field: string): string {
    const ctrl = this.areaForm.get(field);
    if (!ctrl || !ctrl.errors) return '';
    if (ctrl.errors['required'])  return 'This field is required.';
    if (ctrl.errors['minlength']) return `Minimum ${ctrl.errors['minlength'].requiredLength} characters.`;
    return '';
  }

  saveArea(): void {
    if (!this.canSave()) return;
    if (this.areaForm.invalid) {
      this.areaForm.markAllAsTouched();
      return;
    }

    const payload = this.areaForm.getRawValue();
    const editing = this.editingAreaId();
    const request$ = editing 
      ? this.areaService.update({ id: editing, ...payload })
      : this.areaService.create(payload);

    request$.subscribe({
      next: (res) => {
        if (res.success) {
          this.toastr.success(`Area ${editing ? 'updated' : 'created'} successfully.`, 'Success');
          this.resetForm();
          this.loadAreas();
        } else {
          this.toastr.error(res.message, 'Error');
        }
      },
      error: (err) => this.toastr.error(err.error?.message || 'Operation failed.', 'Error'),
    });
  }

  editArea(item: Area): void {
    this.editingAreaId.set(item.id);
    this.areaForm.setValue({ 
      areaName: item.areaName
    });
  }

  deleteArea(id: number): void {
    this.areaService.delete(id).subscribe({
      next: (res) => {
        if (res.success) {
          this.areaList.update((list) => list.filter((a) => a.id !== id));
          if (this.paginatedAreaList().length === 0 && this.currentPage() > 1) {
            this.currentPage.update((p) => p - 1);
          }
          this.toastr.success('Area deleted successfully.', 'Success');
          this.loadAreas(); 
        } else {
          this.toastr.error(res.message, 'Error');
        }
      },
      error: (err) => this.toastr.error(err.error?.message || 'Delete failed.', 'Error'),
    });
  }

  exportToExcel(): void {
    const rows = this.filteredAreaList().map((a) => ({
      'Area ID':   a.id,
      'Area Name': a.areaName
    }));

    if (!rows.length) return;

    const ws = XLSX.utils.json_to_sheet(rows);
    ws['!cols'] = [{ wch: 15 }, { wch: 35 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Areas');
    XLSX.writeFile(wb, 'areas.xlsx');
  }
}
