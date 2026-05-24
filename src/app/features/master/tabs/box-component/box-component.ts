import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import * as XLSX from 'xlsx';

import { BoxService } from '../../../../core/services/setupServices/box-service';
import { BlockService } from '../../../../core/services/setupServices/block-service';
import { ArchService } from '../../../../core/services/setupServices/arch-service';
import { LineService } from '../../../../core/services/setupServices/line-service';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';
import { StorageService } from '../../../../core/services/storage.service';

import { Box } from '../../../../core/models/setups/box/box';
import { Block } from '../../../../core/models/setups/block/block';
import { Arch } from '../../../../core/models/setups/arch/arch';
import { Line } from '../../../../core/models/setups/line/line';
import { MenuResponse } from '../../../../core/models/MenuResponse';
import { StaticData } from '../../../../core/services/static-data';

@Component({
  selector: 'app-box-component',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './box-component.html',
  styleUrl: './box-component.scss',
})
export class BoxComponent implements OnInit {
  private boxService   = inject(BoxService);
  private blockService = inject(BlockService);
  private archService  = inject(ArchService);
  private lineService  = inject(LineService);
  private fb           = inject(FormBuilder);
  private toastr       = inject(ToastrService);
  private errorHandler = inject(ErrorHandlerService);
  private storageService = inject(StorageService);

  protected Math = Math;

  editingBoxId = signal<string | null>(null);
  boxSearch = signal('');
  isLoading = signal(false);
  currentPage = signal(1);
  pageSize    = signal(StaticData.PAGE_SIZE);

  boxList   = signal<Box[]>([]);
  blockList = signal<Block[]>([]);
  archList  = signal<Arch[]>([]);
  lineList  = signal<Line[]>([]);

  boxForm: FormGroup = this.fb.group({
    boxId: [''],
    blockId: ['', [Validators.required]],
    archId: ['', [Validators.required]],
    lineId: ['', [Validators.required]],
    boxCode: ['', [Validators.required]],
    serialNo: ['', [Validators.required, Validators.min(1)]],
    boxName: ['', [Validators.required, Validators.minLength(2)]],
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
  canSave = computed(() => (this.editingBoxId() ? this.canUpdate() : this.canCreate()));

  filteredBoxList = computed(() => {
    const q = this.boxSearch().toLowerCase();
    return this.boxList().filter((b) =>
      (b.boxId || '').toLowerCase().includes(q) ||
      (b.boxName || '').toLowerCase().includes(q) ||
      (b.boxCode || '').toLowerCase().includes(q) ||
      (b.blockName || '').toLowerCase().includes(q)
    );
  });

  totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filteredBoxList().length / this.pageSize()))
  );

  pageNumbers = computed(() =>
    Array.from({ length: this.totalPages() }, (_, i) => i + 1)
  );

  paginatedBoxList = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filteredBoxList().slice(start, start + this.pageSize());
  });

  ngOnInit(): void {
    this.loadPermissionsFromStorage();
    if (this.canView()) {
      this.loadInitialData();
      this.loadBoxes();
    }
  }

  private loadPermissionsFromStorage(): void {
    const menus = this.storageService.getAngularItem<MenuResponse[]>('menus');
    const masterMenu = menus?.find(
      (menu) => menu.name?.toUpperCase() === 'MASTER_SETUP' || menu.url?.toLowerCase() === '/master'
    );
    const currentUrl = '/box';
    const boxMenu = masterMenu?.children?.find(
      (child) => child.url?.toLowerCase() === currentUrl || child.name?.toUpperCase() === 'BOX_SETUP'
    );

    if (!boxMenu) {
      this.permissions.set({ canView: false, canCreate: false, canUpdate: false, canDelete: false });
      return;
    }

    this.permissions.set({
      canView: !!boxMenu.canView,
      canCreate: !!boxMenu.canCreate,
      canUpdate: !!boxMenu.canUpdate,
      canDelete: !!boxMenu.canDelete,
    });
  }

  loadInitialData(): void {
    this.blockService.getAll().subscribe(res => { if (res.success) this.blockList.set(res.data); });
  }

  loadBoxes(): void {
    this.isLoading.set(true);
    this.boxService.getAll().subscribe({
      next: (res) => {
        if (res.success) {
          this.boxList.set(res.data);
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

  onBlockChange(blockId: string): void {
    this.archList.set([]);
    this.boxForm.get('archId')?.setValue('');
    this.lineList.set([]);
    this.boxForm.get('lineId')?.setValue('');
    if (blockId) {
      this.archService.getByBlockId(blockId).subscribe({
        next: (res) => { if (res.success) this.archList.set(res.data); }
      });
    }
  }

  onArchChange(archId: string): void {
    this.lineList.set([]);
    this.boxForm.get('lineId')?.setValue('');
    if (archId) {
      this.lineService.getByArchId(archId).subscribe({
        next: (res) => { if (res.success) this.lineList.set(res.data); }
      });
    }
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
  }

  onPageSizeChange(value: string): void {
    const size = value === 'all' ? this.filteredBoxList().length || 1 : +value;
    this.pageSize.set(size);
    this.currentPage.set(1);
  }

  onSearchChange(value: string): void {
    this.boxSearch.set(value);
    this.currentPage.set(1);
  }

  resetForm(): void {
    this.boxForm.reset({ isActive: true, blockId: '', archId: '', lineId: '' });
    this.editingBoxId.set(null);
  }

  isInvalid(field: string): boolean {
    const ctrl = this.boxForm.get(field);
    return !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched));
  }

  getError(field: string): string {
    const ctrl = this.boxForm.get(field);
    if (!ctrl || !ctrl.errors) return '';
    if (ctrl.errors['required'])  return 'This field is required.';
    if (ctrl.errors['minlength']) return `Minimum ${ctrl.errors['minlength'].requiredLength} characters.`;
    if (ctrl.errors['min']) return `Minimum value is ${ctrl.errors['min'].min}.`;
    return '';
  }

  saveBox(): void {
    if (!this.canSave()) return;
    if (this.boxForm.invalid) {
      this.boxForm.markAllAsTouched();
      return;
    }

    const payload: Box = this.boxForm.getRawValue();
    const editing = this.editingBoxId();
    
    // Look up and map Names based on IDs
    payload.blockName = this.blockList().find(b => b.blockId === payload.blockId)?.blockName;
    payload.archName  = this.archList().find(a => a.archId === payload.archId)?.archName;
    payload.lineName  = this.lineList().find(l => l.lineId === payload.lineId)?.lineName;

    const request$ = editing 
      ? this.boxService.update({ ...payload, boxId: editing })
      : this.boxService.create(payload);

    request$.subscribe({
      next: (res) => {
        if (res.success) {
          this.toastr.success(`Box ${editing ? 'updated' : 'created'} successfully.`, 'Success');
          this.resetForm();
          this.loadBoxes();
        } else {
          this.toastr.error(res.message, 'Error');
        }
      },
      error: (err) => this.errorHandler.handleErrorWithToster(err),
    });
  }

  editBox(item: Box): void {
    this.editingBoxId.set(item.boxId);
    if (item.blockId) {
      this.archService.getByBlockId(item.blockId).subscribe(res => {
        if (res.success) this.archList.set(res.data);
        
        if (item.archId) {
          this.lineService.getByArchId(item.archId).subscribe(lineRes => {
            if (lineRes.success) this.lineList.set(lineRes.data);
            this.boxForm.patchValue(item);
          });
        } else {
          this.boxForm.patchValue(item);
        }
      });
    } else {
      this.boxForm.patchValue(item);
    }
  }
}