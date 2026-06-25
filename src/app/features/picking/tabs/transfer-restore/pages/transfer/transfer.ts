import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import Swal, { SweetAlertResult } from 'sweetalert2';
import { ApiResponse } from '../../../../../../core/models/ApiResponse.model';

// Service Imports
import { BlockService } from '../../../../../../core/services/setupServices/block-service';
import { ArchService } from '../../../../../../core/services/setupServices/arch-service';
import { LineService } from '../../../../../../core/services/setupServices/line-service';
import { BoxService } from '../../../../../../core/services/setupServices/box-service';
import { UserService } from '../../../../../../core/services/userManageServices/user-service';

// Model Imports
import { Block } from '../../../../../../core/models/setups/block/block';
import { Arch } from '../../../../../../core/models/setups/arch/arch';
import { Line } from '../../../../../../core/models/setups/line/line';
import { Box } from '../../../../../../core/models/setups/box/box';
import { UserManage } from '../../../../../../core/models/userManage/user.model';
import { environment } from '../../../../../../../environments/environment';

@Component({
  selector: 'app-transfer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './transfer.html',
  styleUrl: './transfer.scss'
})
export class Transfer implements OnInit {
  private http = inject(HttpClient);
  private toastr = inject(ToastrService);
  private blockService = inject(BlockService);
  private archService = inject(ArchService);
  private lineService = inject(LineService);
  private boxService = inject(BoxService);
  private userService = inject(UserService);

  isLoading = signal(false);

  // Common setups
  blocks = signal<Block[]>([]);
  users = signal<UserManage[]>([]);
  selectedPicker = signal('');

  // Source (Left) Panel Signals
  sourceSelectedBlock = signal('');
  sourceSelectedArch = signal('');
  sourceSelectedLine = signal('');
  sourceArchs = signal<Arch[]>([]);
  sourceLines = signal<Line[]>([]);
  sourcePallets = signal<any[]>([]);

  // Destination (Right) Panel Signals
  destSelectedBlock = signal('');
  destSelectedArch = signal('');
  destSelectedLine = signal('');
  destArchs = signal<Arch[]>([]);
  destLines = signal<Line[]>([]);
  destLocations = signal<any[]>([]);

  // Computed checks for select-all toggles
  isSourceAllSelected = computed(() => {
    const list = this.sourcePallets();
    if (list.length === 0) return false;
    return list.every(item => item.checked);
  });

  isDestAllSelected = computed(() => {
    const list = this.destLocations();
    if (list.length === 0) return false;
    return list.every(item => item.checked);
  });

  ngOnInit(): void {
    this.loadBlocks();
    this.loadUsers();
  }

  // Load Initial Shared Data
  loadBlocks(): void {
    this.blockService.getAll().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.blocks.set(res.data);
        } else {
          this.toastr.error(res.message || 'Failed to load Blocks.', 'Error');
        }
      },
      error: () => this.toastr.error('An error occurred while fetching Blocks.', 'Error')
    });
  }

  loadUsers(): void {
    this.userService.getAll().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.users.set(res.data.filter(u => u.active));
        } else {
          this.toastr.error(res.message || 'Failed to load Users.', 'Error');
        }
      },
      error: () => this.toastr.error('An error occurred while fetching Users.', 'Error')
    });
  }

  // Cascading Logic - Left (Source) Panel
  onSourceBlockChange(blockId: string): void {
    this.sourceSelectedBlock.set(blockId);
    this.sourceSelectedArch.set('');
    this.sourceSelectedLine.set('');
    this.sourceArchs.set([]);
    this.sourceLines.set([]);
    this.sourcePallets.set([]);

    if (blockId) {
      this.archService.getByBlockId(blockId).subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.sourceArchs.set(res.data);
          }
        }
      });
    }
  }

  onSourceArchChange(archId: string): void {
    this.sourceSelectedArch.set(archId);
    this.sourceSelectedLine.set('');
    this.sourceLines.set([]);
    this.sourcePallets.set([]);

    if (archId) {
      this.lineService.getByArchId(archId).subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.sourceLines.set(res.data);
          }
        }
      });
    }
  }

  onSourceLineChange(lineId: string): void {
    this.sourceSelectedLine.set(lineId);
    this.sourcePallets.set([]);

    if (lineId) {
      this.isLoading.set(true);
      // Fetch source pallets on the selected line
      this.http.get<ApiResponse<any[]>>(`${environment.apiUrl}/Picking/GetPalletsByLine/${lineId}`).subscribe({
        next: (res) => {
          this.isLoading.set(false);
          if (res.success && res.data) {
            this.sourcePallets.set(res.data.map(p => ({ ...p, checked: false })));
          } else {
            this.toastr.error(res.message || 'Failed to load pallets in this line.', 'Error');
          }
        },
        error: () => {
          this.isLoading.set(false);
          this.toastr.error('Error fetching pallets.', 'Error');
        }
      });
    }
  }

  // Cascading Logic - Right (Destination) Panel
  onDestBlockChange(blockId: string): void {
    this.destSelectedBlock.set(blockId);
    this.destSelectedArch.set('');
    this.destSelectedLine.set('');
    this.destArchs.set([]);
    this.destLines.set([]);
    this.destLocations.set([]);

    if (blockId) {
      this.archService.getByBlockId(blockId).subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.destArchs.set(res.data);
          }
        }
      });
    }
  }

  onDestArchChange(archId: string): void {
    this.destSelectedArch.set(archId);
    this.destSelectedLine.set('');
    this.destLines.set([]);
    this.destLocations.set([]);

    if (archId) {
      this.lineService.getByArchId(archId).subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.destLines.set(res.data);
          }
        }
      });
    }
  }

  onDestLineChange(lineId: string): void {
    this.destSelectedLine.set(lineId);
    this.destLocations.set([]);

    if (lineId) {
      this.isLoading.set(true);
      this.boxService.getByLineId(lineId).subscribe({
        next: (res) => {
          this.isLoading.set(false);
          if (res.success && res.data) {
            this.destLocations.set(res.data.map(b => ({ ...b, checked: false })));
          } else {
            this.toastr.error(res.message || 'Failed to load locations in this line.', 'Error');
          }
        },
        error: () => {
          this.isLoading.set(false);
          this.toastr.error('Error fetching locations.', 'Error');
        }
      });
    }
  }

  // Checkbox Event Toggles
  toggleSourceAll(checked: boolean): void {
    this.sourcePallets.update(current => current.map(item => ({ ...item, checked })));
  }

  onPalletCheckChange(index: number, checked: boolean): void {
    this.sourcePallets.update(current => {
      const updated = [...current];
      if (updated[index]) {
        updated[index] = { ...updated[index], checked };
      }
      return updated;
    });
  }

  toggleDestAll(checked: boolean): void {
    this.destLocations.update(current => current.map(item => ({ ...item, checked })));
  }

  onLocationCheckChange(index: number, checked: boolean): void {
    this.destLocations.update(current => {
      const updated = [...current];
      if (updated[index]) {
        updated[index] = { ...updated[index], checked };
      }
      return updated;
    });
  }

  // Submissions & Form Operations
  onConfirmTransfer() {
    const selectedPallets = this.sourcePallets().filter(p => p.checked);
    const selectedDests = this.destLocations().filter(l => l.checked);

    if (selectedPallets.length === 0) {
      this.toastr.warning('Please select at least one Source Pallet.', 'Warning');
      return;
    }
    if (!this.selectedPicker()) {
      this.toastr.warning('Please select a Picker Name.', 'Warning');
      return;
    }
    if (selectedDests.length === 0) {
      this.toastr.warning('Please select at least one Destination Location.', 'Warning');
      return;
    }

    Swal.fire({
      title: 'You want to transfer?',
      text: `Do you want to transfer ${selectedPallets.length} pallet(s) to ${selectedDests.length} location(s)?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#00bb31',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, transfer',
      cancelButtonText: 'No, cancel'
    }).then((result: SweetAlertResult) => {
      if (result.isConfirmed) {
        this.executeTransfer(selectedPallets, selectedDests);
      }
    });
  }

  private executeTransfer(pallets: any[], locations: any[]): void {
    this.isLoading.set(true);

    const payload = {
      sourcePalletNos: pallets.map(p => p.palletNo),
      destLocationCodes: locations.map(l => l.controlName),
      pickerName: this.selectedPicker()
    };

    this.http.post<ApiResponse<any>>(`${environment.apiUrl}/Picking/TransferStock`, payload).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res.success) {
          this.toastr.success(res.message || 'Stock transfer completed successfully.', 'Success');
          this.onReset();
        } else {
          this.toastr.error(res.message || 'Failed to complete stock transfer.', 'Error');
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        this.toastr.error(err?.error?.message || 'An error occurred during transfer.', 'Error');
      }
    });
  }

  onReset() {
    this.sourceSelectedBlock.set('');
    this.sourceSelectedArch.set('');
    this.sourceSelectedLine.set('');
    this.sourceArchs.set([]);
    this.sourceLines.set([]);
    this.sourcePallets.set([]);

    this.destSelectedBlock.set('');
    this.destSelectedArch.set('');
    this.destSelectedLine.set('');
    this.destArchs.set([]);
    this.destLines.set([]);
    this.destLocations.set([]);

    this.selectedPicker.set('');
  }
}
