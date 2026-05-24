import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import * as XLSX from 'xlsx';

import { DriverService } from '../../../../core/services/setupServices/driver-service';
import { Driver } from '../../../../core/models/setups/driver/driver';
import { StorageService } from '../../../../core/services/storage.service';
import { MenuResponse } from '../../../../core/models/MenuResponse';
import { StaticData } from '../../../../core/services/static-data';

@Component({
  selector: 'app-driver-component',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './driver-component.html',
  styleUrl: './driver-component.scss',
})
export class DriverComponent implements OnInit {
  private driverService  = inject(DriverService);
  private fb             = inject(FormBuilder);
  private toastr         = inject(ToastrService);
  private storageService = inject(StorageService);

  protected Math = Math;

  editingDriverId = signal<string | null>(null);
  driverSearch = signal('');
  isLoading = signal(false);
  currentPage = signal(1);
  pageSize    = signal(StaticData.PAGE_SIZE);

  driverList = signal<Driver[]>([]);

  driverForm: FormGroup = this.fb.group({
    driverName: ['', [Validators.required, Validators.minLength(2)]],
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

  canSave = computed(() =>
    this.editingDriverId() ? this.canUpdate() : this.canCreate()
  );

  filteredDriverList = computed(() => {
    const q = this.driverSearch().toLowerCase();

    return this.driverList().filter((d) =>
      d.driverId.toLowerCase().includes(q) ||
      d.driverName.toLowerCase().includes(q)
    );
  });

  totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filteredDriverList().length / this.pageSize()))
  );

  pageNumbers = computed(() =>
    Array.from({ length: this.totalPages() }, (_, i) => i + 1)
  );

  paginatedDriverList = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filteredDriverList().slice(start, start + this.pageSize());
  });

  ngOnInit(): void {
    this.loadPermissionsFromStorage();
    if (this.canView()) {
      this.loadDrivers();
    }
  }

  private loadPermissionsFromStorage(): void {
    const menus = this.storageService.getAngularItem<MenuResponse[]>('menus');
    const masterMenu = menus?.find(
      (menu) => menu.name?.toUpperCase() === 'MASTER_SETUP' || menu.url?.toLowerCase() === '/master'
    );
    const currentUrl = '/driver';
    const driverMenu = masterMenu?.children?.find(
      (child) => child.url?.toLowerCase() === currentUrl || child.name?.toUpperCase() === 'DRIVER_SETUP'
    );

    if (!driverMenu) {
      this.permissions.set({ canView: false, canCreate: false, canUpdate: false, canDelete: false });
      return;
    }

    this.permissions.set({
      canView: !!driverMenu.canView,
      canCreate: !!driverMenu.canCreate,
      canUpdate: !!driverMenu.canUpdate,
      canDelete: !!driverMenu.canDelete,
    });
  }

  loadDrivers(): void {
    this.isLoading.set(true);
    this.driverService.getAll().subscribe({
      next: (res) => {
        if (res.success) {
          this.driverList.set(res.data);
        } else {
          this.toastr.error(res.message, 'Error');
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.toastr.error('Failed to load drivers.', 'Error');
        this.isLoading.set(false);
      },
    });
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
  }

  onPageSizeChange(value: string): void {
    const size = value === 'all' ? this.filteredDriverList().length || 1 : +value;
    this.pageSize.set(size);
    this.currentPage.set(1);
  }

  onSearchChange(value: string): void {
    this.driverSearch.set(value);
    this.currentPage.set(1);
  }

  resetForm(): void {
    this.driverForm.reset();
    this.editingDriverId.set(null);
  }

  isInvalid(field: string): boolean {
    const ctrl = this.driverForm.get(field);
    return !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched));
  }

  getError(field: string): string {
    const ctrl = this.driverForm.get(field);
    if (!ctrl || !ctrl.errors) return '';
    if (ctrl.errors['required'])  return 'This field is required.';
    if (ctrl.errors['minlength']) return `Minimum ${ctrl.errors['minlength'].requiredLength} characters.`;
    return '';
  }

  saveDriver(): void {
    if (!this.canSave()) return;
    if (this.driverForm.invalid) {
      this.driverForm.markAllAsTouched();
      return;
    }

    const payload = this.driverForm.getRawValue();
    const editing = this.editingDriverId();
    const request$ = editing 
      ? this.driverService.update({ driverId: editing, ...payload })
      : this.driverService.create(payload);

    request$.subscribe({
      next: (res) => {
        if (res.success) {
          this.toastr.success(`Driver ${editing ? 'updated' : 'created'} successfully.`, 'Success');
          this.resetForm();
          this.loadDrivers();
        } else {
          this.toastr.error(res.message, 'Error');
        }
      },
      error: (err) => this.toastr.error(err.error?.message || 'Operation failed.', 'Error'),
    });
  }

  editDriver(item: Driver): void {
    this.editingDriverId.set(item.driverId);
    this.driverForm.setValue({ 
      driverName: item.driverName
    });
  }

  deleteDriver(id: string): void {
    this.driverService.delete(id).subscribe({
      next: (res) => {
        if (res.success) {
          this.driverList.update((list) => list.filter((d) => d.driverId !== id));
          if (this.paginatedDriverList().length === 0 && this.currentPage() > 1) {
            this.currentPage.update((p) => p - 1);
          }
          this.toastr.success('Driver deleted successfully.', 'Success');
          this.loadDrivers(); 
        } else {
          this.toastr.error(res.message, 'Error');
        }
      },
      error: (err) => this.toastr.error(err.error?.message || 'Delete failed.', 'Error'),
    });
  }

  exportToExcel(): void {
    const rows = this.filteredDriverList().map((d) => ({
      'Driver ID':   d.driverId,
      'Driver Name': d.driverName
    }));

    if (!rows.length) return;

    const ws = XLSX.utils.json_to_sheet(rows);
    ws['!cols'] = [{ wch: 15 }, { wch: 35 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Drivers');
    XLSX.writeFile(wb, 'drivers.xlsx');
  }
}