import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import * as XLSX from 'xlsx';

import { DestinationService } from '../../../../core/services/setupServices/destination-service';
import { Destination } from '../../../../core/models/setups/destination/destination';
import { StorageService } from '../../../../core/services/storage.service';
import { MenuResponse } from '../../../../core/models/MenuResponse';
import { StaticData } from '../../../../core/services/static-data';

@Component({
  selector: 'app-destination-component',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './destination-component.html',
  styleUrl: './destination-component.scss',
})
export class DestinationComponent implements OnInit {
  private destinationService = inject(DestinationService);
  private fb                 = inject(FormBuilder);
  private toastr             = inject(ToastrService);

  protected Math = Math;

  editingDestinationId = signal<string | null>(null);
  destinationSearch = signal('');
  isLoading = signal(false);
  currentPage = signal(1);
  pageSize    = signal(StaticData.PAGE_SIZE);

  destinationList = signal<Destination[]>([]);

  destinationForm: FormGroup = this.fb.group({
    destinationName: ['', [Validators.required, Validators.minLength(2)]],
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
    this.editingDestinationId() ? this.canUpdate() : this.canCreate()
  );

  filteredDestinationList = computed(() => {
    const q = this.destinationSearch().toLowerCase();

    return this.destinationList().filter((d) =>
      d.destinationId.toLowerCase().includes(q) ||
      d.destinationName.toLowerCase().includes(q)
    );
  });

  totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filteredDestinationList().length / this.pageSize()))
  );

  pageNumbers = computed(() =>
    Array.from({ length: this.totalPages() }, (_, i) => i + 1)
  );

  paginatedDestinationList = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();

    return this.filteredDestinationList().slice(start, start + this.pageSize());
  });

  private storageService = inject(StorageService);

  ngOnInit(): void {
    this.loadPermissionsFromStorage();

    if (this.canView()) {
      this.loadDestinations();
    }
  }

  private loadPermissionsFromStorage(): void {
    const menus = this.storageService.getAngularItem<MenuResponse[]>('menus');

    const masterMenu = menus?.find(
      (menu) =>
        menu.name?.toUpperCase() === 'MASTER_SETUP' ||
        menu.url?.toLowerCase() === '/master'
    );

    const currentUrl = '/destinations';

    const destinationMenu = masterMenu?.children?.find(
      (child) =>
        child.url?.toLowerCase() === currentUrl ||
        child.name?.toUpperCase() === 'DESTINATION_SETUP'
    );

    if (!destinationMenu) {
      this.permissions.set({
        canView: false,
        canCreate: false,
        canUpdate: false,
        canDelete: false,
      });

      return;
    }

    this.permissions.set({
      canView: !!destinationMenu.canView,
      canCreate: !!destinationMenu.canCreate,
      canUpdate: !!destinationMenu.canUpdate,
      canDelete: !!destinationMenu.canDelete,
    });
  }

  loadDestinations(): void {
    this.isLoading.set(true);

    this.destinationService.getAll().subscribe({
      next: (res) => {
        if (res.success) {
          this.destinationList.set(
            res.data.map((d) => ({
              destinationId: d.destinationId,
              destinationName: d.destinationName,
            }))
          );
        } else {
          this.toastr.error(res.message, 'Error');
        }

        this.isLoading.set(false);
      },

      error: () => {
        this.toastr.error('Failed to load destinations.', 'Error');
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
        ? this.filteredDestinationList().length || 1
        : +value;

    this.pageSize.set(size);
    this.currentPage.set(1);
  }

  onSearchChange(value: string): void {
    this.destinationSearch.set(value);
    this.currentPage.set(1);
  }

  resetForm(): void {
    this.destinationForm.reset();
    this.editingDestinationId.set(null);
  }

  isInvalid(field: string): boolean {
    const ctrl = this.destinationForm.get(field);

    return !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched));
  }

  getError(field: string): string {
    const ctrl = this.destinationForm.get(field);

    if (!ctrl || !ctrl.errors) return '';

    if (ctrl.errors['required']) {
      return 'This field is required.';
    }

    if (ctrl.errors['minlength']) {
      return `Minimum ${ctrl.errors['minlength'].requiredLength} characters.`;
    }

    return '';
  }

  saveDestination(): void {
    if (!this.canSave()) {
      return;
    }

    if (this.destinationForm.invalid) {
      this.destinationForm.markAllAsTouched();
      return;
    }

    const { destinationName } = this.destinationForm.getRawValue();
    const editing = this.editingDestinationId();

    if (editing) {
      const payload: Destination = {
        destinationId: editing,
        destinationName,
      };

      this.destinationService.update(payload).subscribe({
        next: (res) => {
          if (res.success) {
            this.destinationList.update((list) =>
              list.map((d) =>
                d.destinationId === editing
                  ? {
                      destinationId: d.destinationId,
                      destinationName,
                    }
                  : d
              )
            );

            this.toastr.success(
              'Destination updated successfully.',
              'Success'
            );

            this.resetForm();
            this.loadDestinations();
          } else {
            this.toastr.error(res.message, 'Error');
          }
        },

        error: (err) => this.toastr.error(err.error.message || 'Update failed.', 'Error'),
      });
    } else {
      const payload = {
        destinationName,
      };

      this.destinationService.create(payload as Destination).subscribe({
        next: (res) => {
          if (res.success) {
            this.destinationList.update((list) => [
              ...list,
              {
                destinationId: res.data.destinationId,
                destinationName: res.data.destinationName,
              },
            ]);

            this.toastr.success(
              'Destination created successfully.',
              'Success'
            );

            this.resetForm();
            this.loadDestinations();
          } else {
            this.toastr.error(res.message, 'Error');
          }
        },

        error: (err) => this.toastr.error(err.error.message || 'Create failed.', 'Error'),
      });
    }
  }

  editDestination(item: Destination): void {
    debugger;

    this.editingDestinationId.set(item.destinationId);

    this.destinationForm.setValue({
      destinationName: item.destinationName,
    });
  }

  deleteDestination(id: string): void {
    this.destinationService.delete(id).subscribe({
      next: (res) => {
        if (res.success) {
          this.destinationList.update((list) =>
            list.filter((d) => d.destinationId !== id)
          );

          if (
            this.paginatedDestinationList().length === 0 &&
            this.currentPage() > 1
          ) {
            this.currentPage.update((p) => p - 1);
          }

          this.toastr.success(
            'Destination deleted successfully.',
            'Success'
          );

          this.loadDestinations();
        } else {
          this.toastr.error(res.message, 'Error');
        }
      },

      error: (err) => this.toastr.error(err.error.message || 'Delete failed.', 'Error'),
    });
  }

  exportToExcel(): void {
    const rows = this.filteredDestinationList().map((d) => ({
      'Destination ID': d.destinationId,
      'Destination Name': d.destinationName,
    }));

    if (!rows.length) return;

    const ws = XLSX.utils.json_to_sheet(rows);

    ws['!cols'] = [
      { wch: 18 },
      { wch: 28 },
    ];

    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, ws, 'Destinations');

    XLSX.writeFile(wb, 'destinations.xlsx');
  }
}