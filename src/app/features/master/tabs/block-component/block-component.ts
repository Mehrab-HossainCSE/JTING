import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import * as XLSX from 'xlsx';

import { BlockService } from '../../../../core/services/setupServices/block-service';
import { StorageService } from '../../../../core/services/storage.service';
import { MenuResponse } from '../../../../core/models/MenuResponse';
import { Block } from '../../../../core/models/setups/block/block';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';
import { StaticData } from '../../../../core/services/static-data';

@Component({
  selector: 'app-block-component',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './block-component.html',
  styleUrl: './block-component.scss',
})
export class BlockComponent implements OnInit {
  private blockService = inject(BlockService);
  private fb           = inject(FormBuilder);
  private toastr       = inject(ToastrService);
  private errorHandler = inject(ErrorHandlerService);

  protected Math = Math;

  editingBlockId = signal<string | null>(null);
  blockSearch = signal('');
  isLoading = signal(false);
  currentPage = signal(1);
  pageSize    = signal(StaticData.PAGE_SIZE);

  blockList = signal<Block[]>([]);

  blockForm: FormGroup = this.fb.group({
    blockId: ['', [Validators.required]],
    blockName: ['', [Validators.required, Validators.minLength(2)]],
    parentBranch: [''],
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
  canSave = computed(() => (this.editingBlockId() ? this.canUpdate() : this.canCreate()));

  filteredBlockList = computed(() => {
    const q = this.blockSearch().toLowerCase();
    return this.blockList().filter((b) =>
      (b.blockId || '').toLowerCase().includes(q) ||
      (b.blockName || '').toLowerCase().includes(q) ||
      (b.parentBranch || '').toLowerCase().includes(q)
    );
  });

  totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filteredBlockList().length / this.pageSize()))
  );

  pageNumbers = computed(() =>
    Array.from({ length: this.totalPages() }, (_, i) => i + 1)
  );

  paginatedBlockList = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filteredBlockList().slice(start, start + this.pageSize());
  });

  private storageService = inject(StorageService);

  ngOnInit(): void {
    this.loadPermissionsFromStorage();
    if (this.canView()) {
      this.loadBlocks();
    }
  }

  private loadPermissionsFromStorage(): void {
    const menus = this.storageService.getAngularItem<MenuResponse[]>('menus');
    const masterMenu = menus?.find(
      (menu) => menu.name?.toUpperCase() === 'MASTER_SETUP' || menu.url?.toLowerCase() === '/master'
    );
    const currentUrl = '/block';
    const blockMenu = masterMenu?.children?.find(
      (child) => child.url?.toLowerCase() === currentUrl || child.name?.toUpperCase() === 'BLOCK_SETUP'
    );

    if (!blockMenu) {
      this.permissions.set({ canView: false, canCreate: false, canUpdate: false, canDelete: false });
      return;
    }

    this.permissions.set({
      canView: !!blockMenu.canView,
      canCreate: !!blockMenu.canCreate,
      canUpdate: !!blockMenu.canUpdate,
      canDelete: !!blockMenu.canDelete,
    });
  }

  loadBlocks(): void {
    this.isLoading.set(true);
    this.blockService.getAll().subscribe({
      next: (res) => {
        if (res.success) {
          this.blockList.set(res.data);
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
    const size = value === 'all' ? this.filteredBlockList().length || 1 : +value;
    this.pageSize.set(size);
    this.currentPage.set(1);
  }

  onSearchChange(value: string): void {
    this.blockSearch.set(value);
    this.currentPage.set(1);
  }

  resetForm(): void {
    this.blockForm.reset({
      blockId: '',
      blockName: '',
      parentBranch: '',
      isActive: true
    });
    this.blockForm.get('blockId')?.enable();
    this.editingBlockId.set(null);
  }

  isInvalid(field: string): boolean {
    const ctrl = this.blockForm.get(field);
    return !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched));
  }

  getError(field: string): string {
    const ctrl = this.blockForm.get(field);
    if (!ctrl || !ctrl.errors) return '';
    if (ctrl.errors['required'])  return 'This field is required.';
    if (ctrl.errors['minlength']) return `Minimum ${ctrl.errors['minlength'].requiredLength} characters.`;
    return '';
  }

  saveBlock(): void {
    if (!this.canSave()) return;
    if (this.blockForm.invalid) {
      this.blockForm.markAllAsTouched();
      return;
    }

    const payload: Block = this.blockForm.getRawValue();
    const editing = this.editingBlockId();

    if (editing) {
      payload.blockId = editing; 
      this.blockService.update(payload).subscribe({
        next: (res) => {
          if (res.success) {
            this.toastr.success('Block updated successfully.', 'Success');
            this.resetForm();
            this.loadBlocks();
          } else {
            this.toastr.error(res.message, 'Error');
          }
        },
        error: (err) => this.errorHandler.handleErrorWithToster(err),
      });
    } else {
      this.blockService.create(payload).subscribe({
        next: (res) => {
          if (res.success) {
            this.toastr.success('Block created successfully.', 'Success');
            this.resetForm();
            this.loadBlocks();
          } else {
            this.toastr.error(res.message, 'Error');
          }
        },
        error: (err) => this.errorHandler.handleErrorWithToster(err),
      });
    }
  }

  editBlock(item: Block): void {
    this.editingBlockId.set(item.blockId);
    this.blockForm.patchValue(item);
    this.blockForm.get('blockId')?.disable(); // Prevent editing primary key
  }

  deleteBlock(id: string): void {
    this.blockService.delete(id).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastr.success('Block deleted successfully.', 'Success');
          this.loadBlocks();
        } else {
          this.toastr.error(res.message, 'Error');
        }
      },
      error: (err) => this.errorHandler.handleErrorWithToster(err),
    });
  }

  exportToExcel(): void {
    if (!this.filteredBlockList().length) return;
    const ws = XLSX.utils.json_to_sheet(this.filteredBlockList().map(b => ({
      'Block ID': b.blockId,
      'Block Name': b.blockName,
      'Parent Branch': b.parentBranch,
      'Is Active': b.isActive ? 'Yes' : 'No'
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Blocks');
    XLSX.writeFile(wb, 'blocks.xlsx');
  }
}