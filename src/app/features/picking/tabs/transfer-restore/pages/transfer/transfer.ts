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
import { ErrorHandlerService } from '../../../../../../core/services/error-handler.service';

// Model Imports
import { Block } from '../../../../../../core/models/setups/block/block';
import { Arch } from '../../../../../../core/models/setups/arch/arch';
import { Line } from '../../../../../../core/models/setups/line/line';
import { Box } from '../../../../../../core/models/setups/box/box';
import { UserManage } from '../../../../../../core/models/userManage/user.model';
import { environment } from '../../../../../../../environments/environment';
import { TransferRestoreService } from '../../../../../../core/services/pickingServices/transfer-restore.service';
import { SaveTransferRequest, TransferRestoreItem } from '../../../../../../core/models/picking/transfer-restore';
import { AuthService } from '../../../../../../core/services/auth.service';
import { LoaderService } from '../../../../../../core/services/loader.service';


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
  private transferRestoreService = inject(TransferRestoreService);
  private errorHandler = inject(ErrorHandlerService);
  private authService = inject(AuthService);
  private loaderService = inject(LoaderService);

  isLoading = signal(false);
  isEditMode = signal(false);
  editTransferNo = signal('');

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

    const loggedInUser = this.authService.getLocalStorageUserName();
    if (loggedInUser) {
      this.selectedPicker.set(loggedInUser);
    }

    const state = window.history.state as { editData?: any; transferNo?: string };
    if (state?.editData) {
      this.populateEditData(state.editData, state.transferNo ?? '');
    }
  }

  // Load Initial Shared Data
  loadBlocks(): void {
    this.loaderService.show('Loading blocks...');
    this.blockService.getAll().subscribe({
      next: (res) => {
        this.loaderService.hide();
        if (res.success && res.data) {
          this.blocks.set(res.data);
        } else {
          this.toastr.error(res.message || 'Failed to load Blocks.', 'Error');
        }
      },
      error: (err) => this.errorHandler.handleErrorWithToster(err)
    });
  }

  loadUsers(): void {
    this.loaderService.show('Loading users...');
    this.userService.getAll().subscribe({
      next: (res) => {
        this.loaderService.hide();
        if (res.success && res.data) {
          this.users.set(res.data.filter(u => u.active));
        } else {
          this.toastr.error(res.message || 'Failed to load Users.', 'Error');
        }
      },
      error: (err) => this.errorHandler.handleErrorWithToster(err)
    });
  }

  private populateEditData(editData: any, transferNo: string): void {
    this.isEditMode.set(true);
    this.editTransferNo.set(transferNo);

    const firstItem = editData.transferList?.[0];
    const boxData = editData.boxData;

    const pickerName = boxData?.pickerName || firstItem?.pickerName || '';
    this.selectedPicker.set(pickerName);

    if (!boxData) return;

    // Load Left (Source) Panel cascading filters
    const srcBlockId = boxData.sourceBlockId || '';
    const srcArchId = boxData.sourceArchId || '';
    const srcLineId = boxData.sourceLineId || '';

    this.sourceSelectedBlock.set(srcBlockId);
    if (srcBlockId) {
      this.archService.getByBlockId(srcBlockId).subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.sourceArchs.set(res.data);
            this.sourceSelectedArch.set(srcArchId);

            if (srcArchId) {
              this.lineService.getByArchId(srcArchId).subscribe({
                next: (lineRes) => {
                  if (lineRes.success && lineRes.data) {
                    this.sourceLines.set(lineRes.data);
                    this.sourceSelectedLine.set(srcLineId);

                    if (srcLineId) {
                      this.loaderService.show('Loading source locations...');
                      this.transferRestoreService.getSourceLocations(
                        srcLineId,
                        srcArchId,
                        transferNo
                      ).subscribe({
                        next: (locRes) => {
                          this.loaderService.hide();
                          if (locRes.success && locRes.data) {
                            // Map source locations, checking the ones that match palletNo or sourceBoxLocation/controlName in transferList (supporting block/arch discrepancy via box suffix match)
                            this.sourcePallets.set(locRes.data.map((p: any) => {
                              const isChecked = editData.transferList?.some((t: any) => {
                                const palletMatch = !!(t.palletNo && p.palletNo && t.palletNo === p.palletNo);
                                const locationMatch = !!(t.sourceBoxLocation && p.controlName && (
                                  t.sourceBoxLocation === p.controlName || (
                                    t.sourceBoxLocation.lastIndexOf('B') !== -1 &&
                                    p.controlName.lastIndexOf('B') !== -1 &&
                                    t.sourceBoxLocation.substring(t.sourceBoxLocation.lastIndexOf('B')) === p.controlName.substring(p.controlName.lastIndexOf('B'))
                                  )
                                ));
                                return palletMatch || locationMatch;
                              }) ?? false;
                              return {
                                ...p,
                                controlName: p.controlName || p.sourceBoxLocation || '--',
                                checked: isChecked
                              };
                            }));
                          }
                        },
                        error: (err) => {
                          this.loaderService.hide();
                          this.errorHandler.handleErrorWithToster(err);
                        }
                      });
                    }
                  }
                }
              });
            }
          }
        }
      });
    }

    // Load Right (Destination) Panel cascading filters
    const destBlockId = boxData.destinationBlockId || '';
    const destArchId = boxData.destinationArchId || '';
    const destLineId = boxData.destinationLineId || '';

    this.destSelectedBlock.set(destBlockId);
    if (destBlockId) {
      this.archService.getByBlockId(destBlockId).subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.destArchs.set(res.data);
            this.destSelectedArch.set(destArchId);

            if (destArchId) {
              this.lineService.getByArchId(destArchId).subscribe({
                next: (lineRes) => {
                  if (lineRes.success && lineRes.data) {
                    this.destLines.set(lineRes.data);
                    this.destSelectedLine.set(destLineId);

                    if (destLineId) {
                      this.loaderService.show('Loading destination locations...');
                      this.transferRestoreService.getDestinationLocations(
                        destLineId,
                        destArchId,
                        transferNo
                      ).subscribe({
                        next: (locRes) => {
                          this.loaderService.hide();
                          if (locRes.success && locRes.data) {
                            // Map dest locations, checking the ones that match destinationBoxLocation in transferList (supporting block/arch discrepancy via box suffix match)
                            this.destLocations.set(locRes.data.map((l: any) => {
                              const isChecked = editData.transferList?.some((t: any) =>
                                t.destinationBoxLocation && l.controlName && (
                                  t.destinationBoxLocation === l.controlName || (
                                    t.destinationBoxLocation.lastIndexOf('B') !== -1 &&
                                    l.controlName.lastIndexOf('B') !== -1 &&
                                    t.destinationBoxLocation.substring(t.destinationBoxLocation.lastIndexOf('B')) === l.controlName.substring(l.controlName.lastIndexOf('B'))
                                  )
                                )
                              ) ?? false;
                              return {
                                ...l,
                                checked: isChecked
                              };
                            }));
                          }
                        },
                        error: (err) => {
                          this.loaderService.hide();
                          this.errorHandler.handleErrorWithToster(err);
                        }
                      });
                    }
                  }
                }
              });
            }
          }
        }
      });
    }
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
      this.loaderService.show('Loading archs...');
      this.archService.getByBlockId(blockId).subscribe({
        next: (res) => {
          this.loaderService.hide();
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
      this.loaderService.show('Loading lines...');
      this.lineService.getByArchId(archId).subscribe({
        next: (res) => {
          this.loaderService.hide();
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
      this.loaderService.show('Loading source locations...');
      const numericLineId = lineId;
      const numericArchId = this.sourceSelectedArch();

      this.transferRestoreService.getSourceLocations(numericLineId, numericArchId, '').subscribe({
        next: (res) => {
          this.loaderService.hide();
          if (res.success && res.data) {
            this.sourcePallets.set(res.data.map(p => ({ ...p, checked: false })));
          } else {
            this.toastr.error(res.message || 'Failed to load pallets in this line.', 'Error');
          }
        },
        error: (err) => {
          this.loaderService.hide();
          this.errorHandler.handleErrorWithToster(err);
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
      this.loaderService.show('Loading archs...');
      this.archService.getByBlockId(blockId).subscribe({
        next: (res) => {
          this.loaderService.hide();
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
      this.loaderService.show('Loading lines...');
      this.lineService.getByArchId(archId).subscribe({
        next: (res) => {
          this.loaderService.hide();
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
      this.loaderService.show('Loading destination locations...');
      const numericLineId = lineId;
      const numericArchId = this.destSelectedArch();

      this.transferRestoreService.getDestinationLocations(numericLineId, numericArchId, '').subscribe({
        next: (res) => {
          this.loaderService.hide();
          if (res.success && res.data) {
            this.destLocations.set(res.data.map(b => ({ ...b, checked: false })));
          } else {
            this.toastr.error(res.message || 'Failed to load locations in this line.', 'Error');
          }
        },
        error: (err) => {
          this.loaderService.hide();
          this.errorHandler.handleErrorWithToster(err);
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
    this.loaderService.show('Executing transfer...');

    const payload: SaveTransferRequest = {
      sourceList: pallets.map(p => {
        const { checked, ...rest } = p;
        return {
          ...rest,
          date: p.date || p.transferDate || p.rcvDate || p.createDate || new Date().toISOString()
        } as TransferRestoreItem;
      }),
      destinationList: locations.map(l => {
        const { checked, ...rest } = l;
        return rest as TransferRestoreItem;
      }),
      pickerName: this.selectedPicker(),
      transferNo: this.isEditMode() ? this.editTransferNo() : '',
      isUpdate: this.isEditMode()
    };

    this.transferRestoreService.saveTransfer(payload).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.loaderService.hide();
        if (res.success) {
          this.toastr.success(res.message || 'Stock transfer completed successfully.', 'Success');
          this.onReset();
        } else {
          this.toastr.error(res.message || 'Failed to complete stock transfer.', 'Error');
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        this.loaderService.hide();
        this.errorHandler.handleErrorWithToster(err);
      }
    });
  }

  onReset() {
    this.isEditMode.set(false);
    this.editTransferNo.set('');

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

    const loggedInUser = this.authService.getLocalStorageUserName();
    if (loggedInUser) {
      this.selectedPicker.set(loggedInUser);
    } else {
      this.selectedPicker.set('');
    }
  }
}
