import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import * as XLSX from 'xlsx';

import { DepartmentService } from '../../../../core/services/setupServices/department-service';
import { Department } from '../../../../core/models/setups/department/department';
import { StorageService } from '../../../../core/services/storage.service';
import { MenuResponse } from '../../../../core/models/MenuResponse';

@Component({
  selector: 'app-department-component',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './department-component.html',
  styleUrl: './department-component.scss',
})
export class DepartmentComponent implements OnInit {
  private departmentService = inject(DepartmentService);
  private fb                = inject(FormBuilder);
  private toastr            = inject(ToastrService);

  protected Math = Math;

  editingDepartmentId = signal<string | null>(null);
  departmentSearch = signal('');
  isLoading = signal(false);
  currentPage = signal(1);
  pageSize    = signal(5);

  departmentList = signal<Department[]>([]);

  departmentForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    isActive: [true],
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
    this.editingDepartmentId() ? this.canUpdate() : this.canCreate()
  );

  filteredDepartmentList = computed(() => {
    const q = this.departmentSearch().toLowerCase();

    return this.departmentList().filter((d) =>
      d.id.toLowerCase().includes(q) ||
      d.name.toLowerCase().includes(q)
    );
  });

  totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filteredDepartmentList().length / this.pageSize()))
  );

  pageNumbers = computed(() =>
    Array.from({ length: this.totalPages() }, (_, i) => i + 1)
  );

  paginatedDepartmentList = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();

    return this.filteredDepartmentList().slice(start, start + this.pageSize());
  });

  private storageService = inject(StorageService);

  ngOnInit(): void {
    this.loadPermissionsFromStorage();

    if (this.canView()) {
      this.loadDepartments();
    }
  }

  private loadPermissionsFromStorage(): void {
    const menus = this.storageService.getAngularItem<MenuResponse[]>('menus');

    const masterMenu = menus?.find(
      (menu) =>
        menu.name?.toUpperCase() === 'MASTER_SETUP' ||
        menu.url?.toLowerCase() === '/master'
    );

    const currentUrl = '/department';

    const departmentMenu = masterMenu?.children?.find(
      (child) =>
        child.url?.toLowerCase() === currentUrl ||
        child.name?.toUpperCase() === 'DEPARTMENT_SETUP'
    );

    if (!departmentMenu) {
      this.permissions.set({
        canView: false,
        canCreate: false,
        canUpdate: false,
        canDelete: false,
      });

      return;
    }

    this.permissions.set({
      canView: !!departmentMenu.canView,
      canCreate: !!departmentMenu.canCreate,
      canUpdate: !!departmentMenu.canUpdate,
      canDelete: !!departmentMenu.canDelete,
    });
  }

  loadDepartments(): void {
    this.isLoading.set(true);

    this.departmentService.getAll().subscribe({
      next: (res) => {
        if (res.success) {
          this.departmentList.set(
            res.data.map((d) => ({
              id: d.id,
              name: d.name,
              isActive: d.isActive,
            }))
          );
        } else {
          this.toastr.error(res.message, 'Error');
        }

        this.isLoading.set(false);
      },

      error: () => {
        this.toastr.error('Failed to load departments.', 'Error');
        this.isLoading.set(false);
      },
    });
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages()) return;

    this.currentPage.set(page);
  }

  onPageSizeChange(value: string): void {
    const size =
      value === 'all'
        ? this.filteredDepartmentList().length || 1
        : +value;

    this.pageSize.set(size);
    this.currentPage.set(1);
  }

  onSearchChange(value: string): void {
    this.departmentSearch.set(value);
    this.currentPage.set(1);
  }

  resetForm(): void {
    this.departmentForm.reset({
      name: '',
      isActive: true,
    });

    this.editingDepartmentId.set(null);
  }

  isInvalid(field: string): boolean {
    const ctrl = this.departmentForm.get(field);

    return !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched));
  }

  getError(field: string): string {
    const ctrl = this.departmentForm.get(field);

    if (!ctrl || !ctrl.errors) return '';

    if (ctrl.errors['required']) {
      return 'This field is required.';
    }

    if (ctrl.errors['minlength']) {
      return `Minimum ${ctrl.errors['minlength'].requiredLength} characters.`;
    }

    return '';
  }

  saveDepartment(): void {
    if (!this.canSave()) {
      return;
    }

    if (this.departmentForm.invalid) {
      this.departmentForm.markAllAsTouched();
      return;
    }

    const formValue = this.departmentForm.getRawValue();
    const editing   = this.editingDepartmentId();

    const payload: Department = {
      id: editing ?? '',
      name: formValue.name,
      isActive: formValue.isActive,
    };

    if (editing) {
      this.departmentService.update(payload).subscribe({
        next: (res) => {
          if (res.success) {
            this.departmentList.update((list) =>
              list.map((d) =>
                d.id === editing
                  ? {
                      ...d,
                      name: formValue.name,
                      isActive: formValue.isActive,
                    }
                  : d
              )
            );

            this.toastr.success('Department updated successfully.', 'Success');

            this.resetForm();
            this.loadDepartments();
          } else {
            this.toastr.error(res.message, 'Error');
          }
        },

        error: () => this.toastr.error('Update failed.', 'Error'),
      });
    } else {
      this.departmentService.create(payload).subscribe({
        next: (res) => {
          if (res.success) {
            this.departmentList.update((list) => [
              ...list,
              {
                id: res.data.id,
                name: res.data.name,
                isActive: res.data.isActive,
              },
            ]);

            this.toastr.success('Department created successfully.', 'Success');

            this.resetForm();
            this.loadDepartments();
          } else {
            this.toastr.error(res.message, 'Error');
          }
        },

        error: () => this.toastr.error('Create failed.', 'Error'),
      });
    }
  }

  editDepartment(item: Department): void {
    debugger;

    this.editingDepartmentId.set(item.id);

    this.departmentForm.setValue({
      name: item.name,
      isActive: item.isActive,
    });
  }

  deleteDepartment(id: string): void {
    this.departmentService.delete(id).subscribe({
      next: (res) => {
        if (res.success) {
          this.departmentList.update((list) =>
            list.filter((d) => d.id !== id)
          );

          if (
            this.paginatedDepartmentList().length === 0 &&
            this.currentPage() > 1
          ) {
            this.currentPage.update((p) => p - 1);
          }

          this.toastr.success('Department deleted successfully.', 'Success');

          this.loadDepartments();
        } else {
          this.toastr.error(res.message, 'Error');
        }
      },

      error: () => this.toastr.error('Delete failed.', 'Error'),
    });
  }

  exportToExcel(): void {
    const rows = this.filteredDepartmentList().map((d) => ({
      'Department ID': d.id,
      'Department Name': d.name,
      Status: d.isActive ? 'Active' : 'Inactive',
    }));

    if (!rows.length) return;

    const ws = XLSX.utils.json_to_sheet(rows);

    ws['!cols'] = [
      { wch: 18 },
      { wch: 28 },
      { wch: 14 },
    ];

    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, ws, 'Departments');

    XLSX.writeFile(wb, 'departments.xlsx');
  }
}