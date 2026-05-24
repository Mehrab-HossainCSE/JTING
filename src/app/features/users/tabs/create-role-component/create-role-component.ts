import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { RoleService } from '../../../../core/services/roleManageServices/role-service';
import { StorageService } from '../../../../core/services/storage.service';
import { MenuResponse } from '../../../../core/models/MenuResponse';
import { Role } from '../../../../core/models/role/role';
import { StaticData } from '../../../../core/services/static-data';

@Component({
  selector: 'app-create-role-component',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-role-component.html',
  styleUrl: './create-role-component.scss'
})
export class CreateRoleComponent implements OnInit {
  private roleService    = inject(RoleService);
  private storageService = inject(StorageService);
  private fb             = inject(FormBuilder);
  private toastr         = inject(ToastrService);

  protected Math = Math;

  editingRoleId = signal<number | null>(null);
  roleSearch    = signal('');
  isLoading     = signal(false);
  currentPage   = signal(1);
  pageSize      = signal(StaticData.PAGE_SIZE);

  roleList = signal<Role[]>([]);

  permissions = signal({
    canView:   false,
    canCreate: false,
    canUpdate: false,
    canDelete: false
  });

  canView   = computed(() => this.permissions().canView);
  canCreate = computed(() => this.permissions().canCreate);
  canUpdate = computed(() => this.permissions().canUpdate);
  canDelete = computed(() => this.permissions().canDelete);
  canSave   = computed(() => this.editingRoleId() ? this.canUpdate() : this.canCreate());

  filteredRoleList = computed(() => {
    const query = this.roleSearch().toLowerCase();
    return this.roleList().filter(role =>
      role.name.toLowerCase().includes(query)
    );
  });

  totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filteredRoleList().length / this.pageSize()))
  );

  pageNumbers = computed(() =>
    Array.from({ length: this.totalPages() }, (_, i) => i + 1)
  );

  paginatedRoleList = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filteredRoleList().slice(start, start + this.pageSize());
  });

  roleForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]]
  });

  ngOnInit(): void {
    this.loadPermissionsFromStorage();
    if (this.canView()) {
      this.loadRoles();
    }
  }

  private loadPermissionsFromStorage(): void {
    const menus = this.storageService.getAngularItem<MenuResponse[]>('menus');
    const roleManagementMenu = menus?.find(
      (menu) => menu.name?.toUpperCase().includes('USER_MANAGEMENT') ||
                menu.url?.toLowerCase().includes('/roles')
    );

    const roleMenu = roleManagementMenu?.children?.find(
      (child) => child.name?.toUpperCase().includes('CREATE_ROLE') ||
                 child.url?.toLowerCase().includes('/roles')
    );

    if (!roleMenu) {
      this.permissions.set({ canView: false, canCreate: false, canUpdate: false, canDelete: false });
      return;
    }

    this.permissions.set({
      canView:   !!roleMenu.canView,
      canCreate: !!roleMenu.canCreate,
      canUpdate: !!roleMenu.canUpdate,
      canDelete: !!roleMenu.canDelete
    });
  }

  private loadRoles(): void {
    this.isLoading.set(true);
    this.roleService.getAll().subscribe({
      next: (res) => {
        if (res.success) {
          this.roleList.set(res.data);
        } else {
          this.toastr.error(res.message, 'Error');
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.toastr.error('Failed to load roles.', 'Error');
        this.isLoading.set(false);
      }
    });
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
  }

  onPageSizeChange(value: string): void {
    const size = value === 'all' ? this.filteredRoleList().length || 1 : +value;
    this.pageSize.set(size);
    this.currentPage.set(1);
  }

  onSearchChange(value: string): void {
    this.roleSearch.set(value);
    this.currentPage.set(1);
  }

  resetForm(): void {
    this.editingRoleId.set(null);
    this.roleForm.reset({
      name: ''
    });
  }

  isInvalid(field: string): boolean {
    const ctrl = this.roleForm.get(field);
    return !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched));
  }

  getError(field: string): string {
    const ctrl = this.roleForm.get(field);
    if (!ctrl?.errors) return '';
    if (ctrl.errors['required']) return 'This field is required.';
    if (ctrl.errors['minlength']) return `Minimum ${ctrl.errors['minlength'].requiredLength} characters.`;
    return '';
  }

  saveRole(): void {
    if (!this.canSave()) {
      this.toastr.warning('You do not have permission to perform this action.', 'Warning');
      return;
    }

    if (this.roleForm.invalid) {
      this.roleForm.markAllAsTouched();
      this.toastr.error('Please fill out all required fields correctly.', 'Validation Error');
      return;
    }

    const formValue = this.roleForm.getRawValue();
    const editing   = this.editingRoleId();

    const payload: Role = {
      id: editing ?? 0,
      name: formValue.name
    };

    if (editing) {
      this.roleService.update(payload).subscribe({
        next: (res) => {
          if (res.success) {
            this.toastr.success('Role updated successfully.', 'Success');
            this.resetForm();
            this.loadRoles();
          } else {
            this.toastr.error(res.message, 'Error');
          }
        },
        error: (err) => this.toastr.error(err?.error?.message || 'Failed to update role.', 'Error')
      });
    } else {
      this.roleService.create(payload).subscribe({
        next: (res) => {
          if (res.success) {
            this.toastr.success('Role created successfully.', 'Success');
            this.resetForm();
            this.loadRoles();
          } else {
            this.toastr.error(res.message, 'Error');
          }
        },
        error: (err) => this.toastr.error(err?.error?.message || 'Failed to create role.', 'Error')
      });
    }
  }

  editRole(role: Role): void {
    if (!this.canUpdate()) {
      this.toastr.warning('You do not have permission to edit.', 'Warning');
      return;
    }

    this.editingRoleId.set(role.id);

    this.roleForm.patchValue({
      name: role.name
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
