import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import * as XLSX from 'xlsx';

import { LineService } from '../../../../core/services/setupServices/line-service';
import { StorageService } from '../../../../core/services/storage.service';
import { MenuResponse } from '../../../../core/models/MenuResponse';
import { Line } from '../../../../core/models/setups/line/line';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';

@Component({
  selector: 'app-line-component',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './line-component.html',
  styleUrl: './line-component.scss',
})
export class LineComponent implements OnInit {
  private lineService = inject(LineService);
  private fb          = inject(FormBuilder);
  private toastr      = inject(ToastrService);
  private errorHandler= inject(ErrorHandlerService);

  protected Math = Math;

  editingLineId = signal<string | null>(null);
  lineSearch = signal('');
  isLoading = signal(false);
  currentPage = signal(1);
  pageSize    = signal(10);

  lineList = signal<Line[]>([]);

  lineForm: FormGroup = this.fb.group({
    lineId: ['', [Validators.required]],
    lineName: ['', [Validators.required, Validators.minLength(2)]],
    lineCode: ['', [Validators.required]],
    serialNo: ['', [Validators.required]],
    areaId: [0, [Validators.required, Validators.min(1)]],
    blockId: ['', [Validators.required]],
    archId: ['', [Validators.required]],
    skucode: ['', [Validators.required]],
    isActive: [true],
    areaName: [''],
    blockName: [''],
    archName: ['']
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
  canSave = computed(() => (this.editingLineId() ? this.canUpdate() : this.canCreate()));

  filteredLineList = computed(() => {
    const q = this.lineSearch().toLowerCase();
    return this.lineList().filter((l) =>
      (l.lineId || '').toLowerCase().includes(q) ||
      (l.lineName || '').toLowerCase().includes(q) ||
      (l.lineCode || '').toLowerCase().includes(q)
    );
  });

  totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filteredLineList().length / this.pageSize()))
  );

  pageNumbers = computed(() =>
    Array.from({ length: this.totalPages() }, (_, i) => i + 1)
  );

  paginatedLineList = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filteredLineList().slice(start, start + this.pageSize());
  });

  private storageService = inject(StorageService);

  ngOnInit(): void {
    this.loadPermissionsFromStorage();
    if (this.canView()) {
      this.loadLines();
    }
  }

  private loadPermissionsFromStorage(): void {
    const menus = this.storageService.getAngularItem<MenuResponse[]>('menus');
    const masterMenu = menus?.find(
      (menu) => menu.name?.toUpperCase() === 'MASTER_SETUP' || menu.url?.toLowerCase() === '/master'
    );
    const currentUrl = '/line';
    const lineMenu = masterMenu?.children?.find(
      (child) => child.url?.toLowerCase() === currentUrl || child.name?.toUpperCase() === 'LINE_SETUP'
    );

    if (!lineMenu) {
      this.permissions.set({ canView: false, canCreate: false, canUpdate: false, canDelete: false });
      return;
    }

    this.permissions.set({
      canView: !!lineMenu.canView,
      canCreate: !!lineMenu.canCreate,
      canUpdate: !!lineMenu.canUpdate,
      canDelete: !!lineMenu.canDelete,
    });
  }

  loadLines(): void {
    this.isLoading.set(true);
    this.lineService.getAll().subscribe({
      next: (res) => {
        if (res.success) {
          this.lineList.set(res.data);
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
    const size = value === 'all' ? this.filteredLineList().length || 1 : +value;
    this.pageSize.set(size);
    this.currentPage.set(1);
  }

  onSearchChange(value: string): void {
    this.lineSearch.set(value);
    this.currentPage.set(1);
  }

  resetForm(): void {
    this.lineForm.reset({
      lineId: '',
      lineName: '',
      lineCode: '',
      serialNo: '',
      areaId: 0,
      blockId: '',
      archId: '',
      skucode: '',
      isActive: true,
      areaName: '',
      blockName: '',
      archName: ''
    });
    this.lineForm.get('lineId')?.enable();
    this.editingLineId.set(null);
  }

  isInvalid(field: string): boolean {
    const ctrl = this.lineForm.get(field);
    return !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched));
  }

  getError(field: string): string {
    const ctrl = this.lineForm.get(field);
    if (!ctrl || !ctrl.errors) return '';
    if (ctrl.errors['required'])  return 'This field is required.';
    if (ctrl.errors['minlength']) return `Minimum ${ctrl.errors['minlength'].requiredLength} characters.`;
    if (ctrl.errors['min']) return `Minimum value is ${ctrl.errors['min'].min}.`;
    return '';
  }

  saveLine(): void {
    if (!this.canSave()) return;
    if (this.lineForm.invalid) {
      this.lineForm.markAllAsTouched();
      return;
    }

    const payload: Line = this.lineForm.getRawValue();
    
    // Provide fallback values to satisfy backend validation
    payload.areaName = payload.areaName || `Area ${payload.areaId}`;
    payload.blockName = payload.blockName || `Block ${payload.blockId}`;
    payload.archName = payload.archName || `Arch ${payload.archId}`;
    
    const editing = this.editingLineId();

    if (editing) {
      debugger;
      payload.lineId = editing; 
      this.lineService.update(payload).subscribe({
        next: (res) => {
          if (res.success) {
            this.lineList.update((list) => list.map((l) => l.lineId === editing ? { ...l, ...payload } : l));
            this.toastr.success('Line updated successfully.', 'Success');
            this.resetForm();
            this.loadLines();
          } else {
            this.toastr.error(res.message || res.message, 'Error');
          }
        },
        error: (err) => this.errorHandler.handleErrorWithToster(err),
      });
    } else {
      this.lineService.create(payload).subscribe({
        next: (res) => {
          if (res.success) {
            this.lineList.update((list) => [...list, { ...res.data }]);
            this.toastr.success('Line created successfully.', 'Success');
            this.resetForm();
            this.loadLines();
          } else {
            this.toastr.error(res.message, 'Error');
          }
        },
        error: (err) => this.errorHandler.handleErrorWithToster(err),
      });
    }
  }

  editLine(item: Line): void {
    this.editingLineId.set(item.lineId);
    this.lineForm.patchValue(item);
    this.lineForm.get('lineId')?.disable(); // Prevent editing primary key
  }

  deleteLine(id: string): void {
    this.lineService.delete(id).subscribe({
      next: (res) => {
        if (res.success) {
          this.lineList.update((list) => list.filter((l) => l.lineId !== id));
          if (this.paginatedLineList().length === 0 && this.currentPage() > 1) {
            this.currentPage.update((p) => p - 1);
          }
          this.toastr.success('Line deleted successfully.', 'Success');
          this.loadLines();
        } else {
          this.toastr.error(res.message, 'Error');
        }
      },
      error: (err) => this.errorHandler.handleErrorWithToster(err),
    });
  }

  exportToExcel(): void {
    if (!this.filteredLineList().length) return;
    const ws = XLSX.utils.json_to_sheet(this.filteredLineList());
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Lines');
    XLSX.writeFile(wb, 'lines.xlsx');
  }
}