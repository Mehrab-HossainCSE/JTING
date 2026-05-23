import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import * as XLSX from 'xlsx';
import { Shift } from '../../../../core/models/setups/shift/shift';
import { StorageService } from '../../../../core/services/storage.service';
import { MenuResponse } from '../../../../core/models/MenuResponse';
import { ShiftService } from '../../../../core/services/setupServices/shift-service';

@Component({
  selector: 'app-shift-component',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './shift-component.html',
  styleUrl: './shift-component.scss',
})
export class ShiftComponent implements OnInit {
  private shiftService = inject(ShiftService);
  private fb = inject(FormBuilder);
  private toastr = inject(ToastrService);
  private storageService = inject(StorageService);

  protected Math = Math;

  editingShiftId = signal<string | null>(null);
  shiftSearch = signal('');
  isLoading = signal(false);
  currentPage = signal(1);
  pageSize = signal(5);

  shiftList = signal<Shift[]>([]);

  shiftForm: FormGroup = this.fb.group({
    shiftName: ['', [Validators.required, Validators.minLength(1)]],
    startTime: ['', Validators.required],
    endTime:   ['', Validators.required],
  });

  permissions = signal({
    canView:   false,
    canCreate: false,
    canUpdate: false,
    canDelete: false,
  });

  canView   = computed(() => this.permissions().canView);
  canCreate = computed(() => this.permissions().canCreate);
  canUpdate = computed(() => this.permissions().canUpdate);
  canDelete = computed(() => this.permissions().canDelete);
  canSave   = computed(() => (this.editingShiftId() ? this.canUpdate() : this.canCreate()));

  filteredShiftList = computed(() => {
    const q = this.shiftSearch().toLowerCase();
    return this.shiftList().filter((s) =>
      s.shiftID?.toLowerCase().includes(q) ||
      s.shiftName.toLowerCase().includes(q)
    );
  });

  totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filteredShiftList().length / this.pageSize()))
  );

  pageNumbers = computed(() =>
    Array.from({ length: this.totalPages() }, (_, i) => i + 1)
  );

  paginatedShiftList = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filteredShiftList().slice(start, start + this.pageSize());
  });

  ngOnInit(): void {
    this.loadPermissionsFromStorage();
    if (this.canView()) {
      this.loadShifts();
    }
  }

  private loadPermissionsFromStorage(): void {
    const menus = this.storageService.getAngularItem<MenuResponse[]>('menus');
    const masterMenu = menus?.find(
      (menu) => menu.name?.toUpperCase() === 'MASTER_SETUP' || menu.url?.toLowerCase() === '/master'
    );
    const currentUrl = '/shifts';
    const shiftMenu = masterMenu?.children?.find(
      (child) => child.url?.toLowerCase() === currentUrl || child.name?.toUpperCase() === 'SHIFT_SETUP'
    );

    if (!shiftMenu) {
      this.permissions.set({ canView: false, canCreate: false, canUpdate: false, canDelete: false });
      return;
    }

    this.permissions.set({
      canView:   !!shiftMenu.canView,
      canCreate: !!shiftMenu.canCreate,
      canUpdate: !!shiftMenu.canUpdate,
      canDelete: !!shiftMenu.canDelete,
    });
  }

  loadShifts(): void {
    this.isLoading.set(true);
    this.shiftService.getAll().subscribe({
      next: (res) => {
        if (res.success) {
          this.shiftList.set(
            res.data.map((s) => ({
              shiftID:   s.shiftID,
              shiftName: s.shiftName,
              startTime: s.startTime,
              endTime:   s.endTime,
            }))
          );
        } else {
          this.toastr.error(res.message, 'Error');
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.toastr.error('Failed to load shifts.', 'Error');
        this.isLoading.set(false);
      },
    });
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
  }

  onPageSizeChange(value: string): void {
    const size = value === 'all' ? this.filteredShiftList().length || 1 : +value;
    this.pageSize.set(size);
    this.currentPage.set(1);
  }

  onSearchChange(value: string): void {
    this.shiftSearch.set(value);
    this.currentPage.set(1);
  }

  resetForm(): void {
    this.shiftForm.reset();
    this.editingShiftId.set(null);
  }

  isInvalid(field: string): boolean {
    const ctrl = this.shiftForm.get(field);
    return !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched));
  }

  getError(field: string): string {
    const ctrl = this.shiftForm.get(field);
    if (!ctrl || !ctrl.errors) return '';
    if (ctrl.errors['required'])  return 'This field is required.';
    if (ctrl.errors['minlength']) return `Minimum ${ctrl.errors['minlength'].requiredLength} characters.`;
    return '';
  }

  saveShift(): void {
    if (this.shiftForm.invalid) {
      this.shiftForm.markAllAsTouched();
      return;
    }

    const editing = this.editingShiftId();
    const { shiftName, startTime, endTime } = this.shiftForm.getRawValue();

    if (editing) {
      const payload: Shift = { shiftID: editing, shiftName, startTime, endTime };

      this.shiftService.update(payload).subscribe({
        next: (res) => {
          if (res.success) {
            this.shiftList.update((list) =>
              list.map((s) =>
                s.shiftID === editing
                  ? { shiftID: s.shiftID, shiftName, startTime, endTime }
                  : s
              )
            );
            this.toastr.success('Shift updated successfully.', 'Success');
            this.resetForm();
            this.loadShifts();
          } else {
            this.toastr.error(res.message, 'Error');
          }
        },
        error: () => this.toastr.error('Update failed.', 'Error'),
      });
    } else {
      if (!this.canCreate()) return;
      const payload = { shiftName, startTime, endTime };

      this.shiftService.create(payload).subscribe({
        next: (res) => {
          if (res.success) {
            this.shiftList.update((list) => [
              ...list,
              {
                shiftID:   res.data.shiftID,
                shiftName: res.data.shiftName,
                startTime: res.data.startTime,
                endTime:   res.data.endTime,
              },
            ]);
            this.toastr.success('Shift created successfully.', 'Success');
            this.resetForm();
            this.loadShifts();
          } else {
            this.toastr.error(res.message, 'Error');
          }
        },
        error: () => this.toastr.error('Create failed.', 'Error'),
      });
    }
  }

  // ← THIS is the fix: log shiftId to confirm it's not undefined
  editShift(item: Shift): void {
    debugger;
    const id = item.shiftID;
    if (!id) {
      this.toastr.error('Cannot edit: shift ID is missing.', 'Error');
      return;
    }
    this.editingShiftId.set(id);
    this.shiftForm.patchValue({
      shiftName: item.shiftName,
      startTime: item.startTime,
      endTime:   item.endTime,
    });
  }

  deleteShift(id: string): void {
    this.shiftService.delete(id).subscribe({
      next: (res) => {
        if (res.success) {
          this.shiftList.update((list) => list.filter((s) => s.shiftID !== id));
          if (this.paginatedShiftList().length === 0 && this.currentPage() > 1) {
            this.currentPage.update((p) => p - 1);
          }
          this.toastr.success('Shift deleted successfully.', 'Success');
          this.loadShifts();
        } else {
          this.toastr.error(res.message, 'Error');
        }
      },
      error: () => this.toastr.error('Delete failed.', 'Error'),
    });
  }

  exportToExcel(): void {
    const rows = this.filteredShiftList().map((s) => ({
      'Shift ID':   s.shiftID,
      'Shift Name': s.shiftName,
      'Start Time': s.startTime,
      'End Time':   s.endTime,
    }));

    if (!rows.length) return;

    const ws = XLSX.utils.json_to_sheet(rows);
    ws['!cols'] = [{ wch: 16 }, { wch: 24 }, { wch: 16 }, { wch: 16 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Shifts');
    XLSX.writeFile(wb, 'shifts.xlsx');
  }
}