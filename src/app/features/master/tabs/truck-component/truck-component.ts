import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import * as XLSX from 'xlsx';

import { TruckService } from '../../../../core/services/setupServices/truck-service';
import { Truck } from '../../../../core/models/setups/truck/truck';
import { StorageService } from '../../../../core/services/storage.service';
import { MenuResponse } from '../../../../core/models/MenuResponse';
import { StaticData } from '../../../../core/services/static-data';

@Component({
  selector: 'app-truck-component',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './truck-component.html',
  styleUrl: './truck-component.scss',
})
export class TruckComponent implements OnInit {
  private truckService   = inject(TruckService);
  private fb             = inject(FormBuilder);
  private toastr         = inject(ToastrService);
  private storageService = inject(StorageService);

  protected Math = Math;

  editingTruckId = signal<string | null>(null);
  truckSearch = signal('');
  isLoading = signal(false);
  currentPage = signal(1);
  pageSize    = signal(StaticData.PAGE_SIZE);

  truckList = signal<Truck[]>([]);

  truckForm: FormGroup = this.fb.group({
    truckName: ['', [Validators.required, Validators.minLength(2)]],
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
    this.editingTruckId() ? this.canUpdate() : this.canCreate()
  );

  filteredTruckList = computed(() => {
    const q = this.truckSearch().toLowerCase();

    return this.truckList().filter((t) =>
      t.truckId.toLowerCase().includes(q) ||
      t.truckName.toLowerCase().includes(q)
    );
  });

  totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filteredTruckList().length / this.pageSize()))
  );

  pageNumbers = computed(() =>
    Array.from({ length: this.totalPages() }, (_, i) => i + 1)
  );

  paginatedTruckList = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filteredTruckList().slice(start, start + this.pageSize());
  });

  ngOnInit(): void {
    this.loadPermissionsFromStorage();
    if (this.canView()) {
      this.loadTrucks();
    }
  }

  private loadPermissionsFromStorage(): void {
    const menus = this.storageService.getAngularItem<MenuResponse[]>('menus');
    const masterMenu = menus?.find(
      (menu) => menu.name?.toUpperCase() === 'MASTER_SETUP' || menu.url?.toLowerCase() === '/master'
    );
    const currentUrl = '/trucks';
    const truckMenu = masterMenu?.children?.find(
      (child) => child.url?.toLowerCase() === currentUrl || child.name?.toUpperCase() === 'TRUCKS_SETUP'
    );

    if (!truckMenu) {
      this.permissions.set({ canView: false, canCreate: false, canUpdate: false, canDelete: false });
      return;
    }

    this.permissions.set({
      canView: !!truckMenu.canView,
      canCreate: !!truckMenu.canCreate,
      canUpdate: !!truckMenu.canUpdate,
      canDelete: !!truckMenu.canDelete,
    });
  }

  loadTrucks(): void {
    this.isLoading.set(true);
    this.truckService.getAll().subscribe({
      next: (res) => {
        if (res.success) {
          this.truckList.set(res.data);
        } else {
          this.toastr.error(res.message, 'Error');
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.toastr.error('Failed to load trucks.', 'Error');
        this.isLoading.set(false);
      },
    });
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
  }

  onPageSizeChange(value: string): void {
    const size = value === 'all' ? this.filteredTruckList().length || 1 : +value;
    this.pageSize.set(size);
    this.currentPage.set(1);
  }

  onSearchChange(value: string): void {
    this.truckSearch.set(value);
    this.currentPage.set(1);
  }

  resetForm(): void {
    this.truckForm.reset();
    this.editingTruckId.set(null);
  }

  isInvalid(field: string): boolean {
    const ctrl = this.truckForm.get(field);
    return !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched));
  }

  getError(field: string): string {
    const ctrl = this.truckForm.get(field);
    if (!ctrl || !ctrl.errors) return '';
    if (ctrl.errors['required'])  return 'This field is required.';
    if (ctrl.errors['minlength']) return `Minimum ${ctrl.errors['minlength'].requiredLength} characters.`;
    return '';
  }

  saveTruck(): void {
    if (!this.canSave()) return;
    if (this.truckForm.invalid) {
      this.truckForm.markAllAsTouched();
      return;
    }

    const payload = this.truckForm.getRawValue();
    const editing = this.editingTruckId();
    const request$ = editing 
      ? this.truckService.update({ truckId: editing, ...payload })
      : this.truckService.create(payload);

    request$.subscribe({
      next: (res) => {
        if (res.success) {
          this.toastr.success(`Truck ${editing ? 'updated' : 'created'} successfully.`, 'Success');
          this.resetForm();
          this.loadTrucks();
        } else {
          this.toastr.error(res.message, 'Error');
        }
      },
      error: (err) => this.toastr.error(err.error?.message || 'Operation failed.', 'Error'),
    });
  }

  editTruck(item: Truck): void {
    this.editingTruckId.set(item.truckId);
    this.truckForm.setValue({ 
      truckName: item.truckName
    });
  }

  deleteTruck(id: string): void {
    this.truckService.delete(id).subscribe({
      next: (res) => {
        if (res.success) {
          this.truckList.update((list) => list.filter((t) => t.truckId !== id));
          if (this.paginatedTruckList().length === 0 && this.currentPage() > 1) {
            this.currentPage.update((p) => p - 1);
          }
          this.toastr.success('Truck deleted successfully.', 'Success');
          this.loadTrucks(); 
        } else {
          this.toastr.error(res.message, 'Error');
        }
      },
      error: (err) => this.toastr.error(err.error?.message || 'Delete failed.', 'Error'),
    });
  }

  exportToExcel(): void {
    const rows = this.filteredTruckList().map((t) => ({
      'Truck ID':   t.truckId,
      'Truck Name': t.truckName
    }));

    if (!rows.length) return;

    const ws = XLSX.utils.json_to_sheet(rows);
    ws['!cols'] = [{ wch: 15 }, { wch: 35 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Trucks');
    XLSX.writeFile(wb, 'trucks.xlsx');
  }
}
