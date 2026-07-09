import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { UserService } from '../../../../core/services/user-service';
import { DepartmentService } from '../../../../core/services/setupServices/department-service';
import { RoleService } from '../../../../core/services/roleManageServices/role-service';
import { StorageService } from '../../../../core/services/storage.service';
import { MenuResponse } from '../../../../core/models/MenuResponse';
import { UserManage } from '../../../../core/models/userManage/user.model';
import { Department } from '../../../../core/models/setups/department/department';
import { Role } from '../../../../core/models/role/role';
import { StaticData } from '../../../../core/services/static-data';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';

@Component({
  selector: 'app-create-user-component',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-user-component.html',
  styleUrl: './create-user-component.scss'
})
export class CreateUserComponent implements OnInit {
  private userService = inject(UserService);
  private departmentService = inject(DepartmentService);
  private roleService = inject(RoleService);
  private storageService = inject(StorageService);
  private fb = inject(FormBuilder);
  private toastr = inject(ToastrService);
  private errorHandler = inject(ErrorHandlerService);

  protected Math = Math;

  editingUserId = signal<number | null>(null);
  isEditing = computed(() => this.editingUserId() !== null);
  userSearch = signal('');
  isLoading = signal(false);
  currentPage = signal(1);
  pageSize = signal(StaticData.PAGE_SIZE);

  userList = signal<UserManage[]>([]);
  departments = signal<Department[]>([]);
  roles = signal<Role[]>([]);

  filteredDepartments = computed(() =>
    this.departments().filter(d => d.isActive)
  );

  userForm: FormGroup = this.fb.group({
    userName: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    fullName: ['', [Validators.required, Validators.minLength(2)]],
    roleName: ['', Validators.required],
    departmentId: ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(3)]],
    confirmPassword: ['', Validators.required],
    active: [true]
  }, { validators: this.passwordMatchValidator });

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { mismatch: true };
    }
    return null;
  }

  permissions = signal({
    canView: false,
    canCreate: false,
    canUpdate: false,
    canDelete: false
  });

  canView = computed(() => this.permissions().canView);
  canCreate = computed(() => this.permissions().canCreate);
  canUpdate = computed(() => this.permissions().canUpdate);
  canDelete = computed(() => this.permissions().canDelete);
  canSave = computed(() => this.isEditing() ? this.canUpdate() : this.canCreate());

  filteredUserList = computed(() => {
    const q = this.userSearch().toLowerCase();
    return this.userList().filter(u =>
      u.userName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.fullName.toLowerCase().includes(q)
    );
  });

  totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filteredUserList().length / this.pageSize()))
  );

  pageNumbers = computed(() =>
    Array.from({ length: this.totalPages() }, (_, i) => i + 1)
  );

  paginatedUserList = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filteredUserList().slice(start, start + this.pageSize());
  });

  ngOnInit(): void {
    this.loadPermissionsFromStorage();
    if (this.canView()) {
      this.loadDepartments();
      this.loadRoles();
      this.loadUsers();
    }
  }

  private loadPermissionsFromStorage(): void {
    const menus = this.storageService.getAngularItem<MenuResponse[]>('menus');
    const userManagementMenu = menus?.find(
      (menu) => menu.name?.toUpperCase() === 'USER_MANAGEMENT' ||
        menu.url?.toLowerCase().includes('/users')
    );

    const userMenu = userManagementMenu?.children?.find(
      (child) => child.name?.toUpperCase() === 'CREATE_USER' ||
        child.url?.toLowerCase() === '/users'
    );

    if (!userMenu) {
      this.permissions.set({ canView: false, canCreate: false, canUpdate: false, canDelete: false });
      return;
    }

    this.permissions.set({
      canView: !!userMenu.canView,
      canCreate: !!userMenu.canCreate,
      canUpdate: !!userMenu.canUpdate,
      canDelete: !!userMenu.canDelete
    });
  }

  private loadDepartments(): void {
    this.departmentService.getAll().subscribe({
      next: (res) => {
        if (res.success) this.departments.set(res.data);
        else this.toastr.error(res.message, 'Error');
      },
      error: () => this.toastr.error('Failed to load departments.', 'Error')
    });
  }

  private loadRoles(): void {
    this.roleService.getAll().subscribe({
      next: (res) => {
        if (res.success) this.roles.set(res.data);
        else this.toastr.error(res.message, 'Error');
      },
      error: () => this.toastr.error('Failed to load roles.', 'Error')
    });
  }

  loadUsers(): void {
    this.isLoading.set(true);
    this.userService.getAll().subscribe({
      next: (res) => {
        if (res.success) this.userList.set(res.data);
        else this.toastr.error(res.message, 'Error');
        this.isLoading.set(false);
      },
      error: () => {
        this.toastr.error('Failed to load users.', 'Error');
        this.isLoading.set(false);
      }
    });
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
  }

  onPageSizeChange(value: string): void {
    const size = value === 'all' ? this.filteredUserList().length || 1 : +value;
    this.pageSize.set(size);
    this.currentPage.set(1);
  }

  onSearchChange(value: string): void {
    this.userSearch.set(value);
    this.currentPage.set(1);
  }

  resetForm(): void {
    this.editingUserId.set(null);
    this.userForm.reset({ active: true });
    this.setPasswordValidators(false);
  }

  private setPasswordValidators(isEditing: boolean): void {
    const password = this.userForm.get('password');
    const confirmPassword = this.userForm.get('confirmPassword');
    if (!password || !confirmPassword) return;

    if (isEditing) {
      password.clearValidators();
      confirmPassword.clearValidators();
    } else {
      password.setValidators([Validators.required, Validators.minLength(3)]);
      confirmPassword.setValidators([Validators.required]);
    }

    password.updateValueAndValidity();
    confirmPassword.updateValueAndValidity();
  }

  isInvalid(field: string): boolean {
    const ctrl = this.userForm.get(field);
    const isFieldInvalid = !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched));

    if (field === 'confirmPassword' && this.userForm.hasError('mismatch') && (ctrl?.dirty || ctrl?.touched)) {
      return true;
    }

    return isFieldInvalid;
  }

  getError(field: string): string {
    const ctrl = this.userForm.get(field);

    if (ctrl?.errors) {
      if (ctrl.errors['required']) return 'This field is required.';
      if (ctrl.errors['minlength']) return `Minimum ${ctrl.errors['minlength'].requiredLength} characters.`;
      if (ctrl.errors['email']) return 'Invalid email format.';
    }

    if (field === 'confirmPassword' && this.userForm.hasError('mismatch')) {
      return 'Passwords do not match.';
    }

    return '';
  }

  saveUser(): void {
    debugger;
    if (!this.canSave()) {
      this.toastr.warning('You do not have permission to perform this action.', 'Warning');
      return;
    }

    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      this.toastr.error('Please fill out all required fields correctly.', 'Validation Error');
      return;
    }

    const formValue = this.userForm.getRawValue();
    const editing = this.editingUserId();

    if (editing) {
      const updatePayload: UserManage = {
        id: editing,
        userName: formValue.userName,
        email: formValue.email,
        fullName: formValue.fullName,
        roleName: formValue.roleName,
        departmentId: formValue.departmentId,
        active: formValue.active
      };

      this.userService.update(updatePayload).subscribe({
        next: (res) => {
          if (res.success) {
            this.userList.update(list =>
              list.map(u => u.id === editing ? res.data : u)
            );
            this.toastr.success('User updated successfully.', 'Success');
            this.resetForm();
            this.loadUsers();
          } else {
            this.toastr.error(res.message, 'Error');
          }
        },
        error: (err) => {
          this.errorHandler.handleErrorWithToster(err);
        }
      });

    } else {

      const createPayload: UserManage = {
        id: 0,
        userName: formValue.userName,
        email: formValue.email,
        fullName: formValue.fullName,
        departmentId: formValue.departmentId,
        roleName: formValue.roleName,
        active: true,
        password: formValue.password,
        confirmPassword: formValue.confirmPassword
      };

      this.userService.create(createPayload).subscribe({
        next: (res) => {
          if (res.success) {
            this.toastr.success('User created successfully.', 'Success');
            this.resetForm();
            this.loadUsers();
          } else {
            this.toastr.error(res.message, 'Error');
          }
        },
        error: (err) => {
          this.errorHandler.handleErrorWithToster(err);
        }
      });
    }
  }

  editUser(user: UserManage): void {
    if (!this.canUpdate()) {
      this.toastr.warning('You do not have permission to edit.', 'Warning');
      return;
    }

    this.editingUserId.set(user.id);
    this.setPasswordValidators(true);
    this.userForm.patchValue({
      userName: user.userName,
      email: user.email,
      fullName: user.fullName,
      roleName: user.roleName,
      departmentId: user.departmentId,
      active: user.active,
      password: '',
      confirmPassword: ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  deleteUser(user: UserManage): void {
    if (!this.canDelete()) {
      this.toastr.warning('You do not have permission to delete.', 'Warning');
      return;
    }

    if (confirm(`Are you sure you want to delete user "${user.userName}"?`)) {
      this.userService.softDelete(user.id).subscribe({
        next: (res) => {
          if (res.success) {
            this.userList.update(list => list.filter(u => u.id !== user.id));
            this.toastr.success('User deleted successfully.', 'Success');
          } else {
            this.toastr.error(res.message, 'Error');
          }
        },
        error: (err) => this.errorHandler.handleErrorWithToster(err)
      });
    }
  }

  getDepartmentName(depId: string): string {
    return this.departments().find(d => d.id === depId)?.name || '---';
  }

  getRoleName(roleId: string): string {
    return this.roles().find(r => r.id.toString() === roleId)?.name || '---';
  }

  getInitials(fullName: string): string {
    if (!fullName) return '';
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  getCircleClass(userName: string): string {
    const hash = userName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const colorNum = (hash % 5) + 1;
    return `c-${colorNum}`;
  }

  getRoleClass(roleName: string): string {
    const role = roleName?.toLowerCase() || '';
    if (role.includes('admin')) return 'admin';
    if (role.includes('manager')) return 'manager';
    if (role.includes('operator')) return 'operator';
    if (role.includes('supervisor')) return 'supervisor';
    return 'viewer';
  }
}