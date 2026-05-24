import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import * as XLSX from 'xlsx';

import { ArchService } from '../../../../core/services/setupServices/arch-service';
import { StorageService } from '../../../../core/services/storage.service';
import { MenuResponse } from '../../../../core/models/MenuResponse';
import { Arch } from '../../../../core/models/setups/arch/arch';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';
import { BlockService } from '../../../../core/services/setupServices/block-service';
import { Block } from '../../../../core/models/setups/block/block';
import { StaticData } from '../../../../core/services/static-data';

@Component({
  selector: 'app-arch-component',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './arch-component.html',
  styleUrl: './arch-component.scss',
})
export class ArchComponent implements OnInit {
  private archService  = inject(ArchService);
  private fb           = inject(FormBuilder);
  private toastr       = inject(ToastrService);
  private errorHandler = inject(ErrorHandlerService);
  private blockService = inject(BlockService);
  

  protected Math = Math;

  editingArchId = signal<string | null>(null);
  archSearch = signal('');
  isLoading = signal(false);
  currentPage = signal(1);
  pageSize    = signal(StaticData.PAGE_SIZE);

  archList = signal<Arch[]>([]);
  blockList = signal<Block[]>([]);

  archForm: FormGroup = this.fb.group({
    archId: ['', [Validators.required]],
    archName: ['', [Validators.required, Validators.minLength(2)]],
    blockId: ['', [Validators.required]],
    isActive: [true],
    blockName: ['']
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
  canSave = computed(() => (this.editingArchId() ? this.canUpdate() : this.canCreate()));

  filteredArchList = computed(() => {
    const q = this.archSearch().toLowerCase();
    return this.archList().filter((a) =>
      (a.archId || '').toLowerCase().includes(q) ||
      (a.archName || '').toLowerCase().includes(q) ||
      (a.blockId || '').toLowerCase().includes(q)
    );
  });

  totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filteredArchList().length / this.pageSize()))
  );

  pageNumbers = computed(() =>
    Array.from({ length: this.totalPages() }, (_, i) => i + 1)
  );

  paginatedArchList = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filteredArchList().slice(start, start + this.pageSize());
  });

  private storageService = inject(StorageService);

  ngOnInit(): void {
    this.loadPermissionsFromStorage();
    if (this.canView()) {
      this.loadBlocks();
      this.loadArches();
    }
  }

  private loadPermissionsFromStorage(): void {
    const menus = this.storageService.getAngularItem<MenuResponse[]>('menus');
    const masterMenu = menus?.find(
      (menu) => menu.name?.toUpperCase() === 'MASTER_SETUP' || menu.url?.toLowerCase() === '/master'
    );
    const currentUrl = '/arch';
    const archMenu = masterMenu?.children?.find(
      (child) => child.url?.toLowerCase() === currentUrl || child.name?.toUpperCase() === 'ARCH_SETUP'
    );

    if (!archMenu) {
      this.permissions.set({ canView: false, canCreate: false, canUpdate: false, canDelete: false });
      return;
    }

    this.permissions.set({
      canView: !!archMenu.canView,
      canCreate: !!archMenu.canCreate,
      canUpdate: !!archMenu.canUpdate,
      canDelete: !!archMenu.canDelete,
    });
  }

  loadBlocks(): void {
    this.blockService.getAll().subscribe({
      next: (res) => {
        if (res.success) {
          this.blockList.set(res.data);
        }
      },
      error: (err) => {
        this.errorHandler.handleErrorWithToster(err);
      },
    });
  }

  loadArches(): void {
    this.isLoading.set(true);
    this.archService.getAll().subscribe({
      next: (res) => {
        if (res.success) {
          this.archList.set(res.data);
        } else {
          this.toastr.error(res.message, 'Error');
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorHandler.handleErrorWithToster(err);
        this.isLoading.set(false);
      },
    });
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
  }

  onPageSizeChange(value: string): void {
    const size = value === 'all' ? this.filteredArchList().length || 1 : +value;
    this.pageSize.set(size);
    this.currentPage.set(1);
  }

  onSearchChange(value: string): void {
    this.archSearch.set(value);
    this.currentPage.set(1);
  }

  resetForm(): void {
    this.archForm.reset({
      archId: '',
      archName: '',
      blockId: '',
      isActive: true,
      blockName: ''
    });
    this.archForm.get('archId')?.enable();
    this.editingArchId.set(null);
  }

  isInvalid(field: string): boolean {
    const ctrl = this.archForm.get(field);
    return !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched));
  }

  getError(field: string): string {
    const ctrl = this.archForm.get(field);
    if (!ctrl || !ctrl.errors) return '';
    if (ctrl.errors['required'])  return 'This field is required.';
    if (ctrl.errors['minlength']) return `Minimum ${ctrl.errors['minlength'].requiredLength} characters.`;
    return '';
  }

  saveArch(): void {
    if (!this.canSave()) return;
    if (this.archForm.invalid) {
      this.archForm.markAllAsTouched();
      return;
    }

    const payload: Arch = this.archForm.getRawValue();
    
    // Get the name of the selected block
    const selectedBlock = this.blockList().find(b => b.blockId === payload.blockId);
    payload.blockName = selectedBlock ? selectedBlock.blockName : `Block ${payload.blockId}`;
    
    const editing = this.editingArchId();

    if (editing) {
      payload.archId = editing; 
      this.archService.update(payload).subscribe({
        next: (res) => {
          if (res.success) {
            this.archList.update((list) => list.map((a) => a.archId === editing ? { ...a, ...payload } : a));
            this.toastr.success('Arch updated successfully.', 'Success');
            this.resetForm();
            this.loadArches();
          } else {
            this.toastr.error(res.message, 'Error');
          }
        },
        error: (err) => this.errorHandler.handleErrorWithToster(err),
      });
    } else {
      this.archService.create(payload).subscribe({
        next: (res) => {
          if (res.success) {
            this.archList.update((list) => [...list, { ...res.data }]);
            this.toastr.success('Arch created successfully.', 'Success');
            this.resetForm();
            this.loadArches();
          } else {
            this.toastr.error(res.message, 'Error');
          }
        },
        error: (err) => this.errorHandler.handleErrorWithToster(err),
      });
    }
  }

  editArch(item: Arch): void {
    this.editingArchId.set(item.archId);
    this.archForm.patchValue(item);
    this.archForm.get('archId')?.disable(); // Prevent editing primary key
  }

  deleteArch(id: string): void {
    this.archService.delete(id).subscribe({
      next: (res) => {
        if (res.success) {
          this.archList.update((list) => list.filter((a) => a.archId !== id));
          if (this.paginatedArchList().length === 0 && this.currentPage() > 1) {
            this.currentPage.update((p) => p - 1);
          }
          this.toastr.success('Arch deleted successfully.', 'Success');
          this.loadArches();
        } else {
          this.toastr.error(res.message, 'Error');
        }
      },
      error: (err) => this.errorHandler.handleErrorWithToster(err),
    });
  }

  exportToExcel(): void {
    if (!this.filteredArchList().length) return;
    const ws = XLSX.utils.json_to_sheet(this.filteredArchList().map(a => ({
      'Arch ID': a.archId,
      'Arch Name': a.archName,
      'Block ID': a.blockId,
      'Is Active': a.isActive ? 'Yes' : 'No'
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Arches');
    XLSX.writeFile(wb, 'arches.xlsx');
  }
}
