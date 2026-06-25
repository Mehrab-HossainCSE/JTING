import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SkuService } from '../../../../../../core/services/skuServices/sku-service';
import { PickingService } from '../../../../../../core/services/pickingServices/picking-service';
import { Sku } from '../../../../../../core/models/setups/sku/sku';
import { SkuSetting } from '../../../../../../core/models/setups/sku/sku-setting';
import { UserService } from '../../../../../../core/services/userManageServices/user-service';
import { UserManage } from '../../../../../../core/models/userManage/user.model';
import { AuthService } from '../../../../../../core/services/auth.service';
import { ErrorHandlerService } from '../../../../../../core/services/error-handler.service';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute } from '@angular/router';
import { BlockService } from '../../../../../../core/services/setupServices/block-service';
import { ArchService } from '../../../../../../core/services/setupServices/arch-service';
import { LineService } from '../../../../../../core/services/setupServices/line-service';
import { BoxService } from '../../../../../../core/services/setupServices/box-service';
import { Block } from '../../../../../../core/models/setups/block/block';
import { Arch } from '../../../../../../core/models/setups/arch/arch';
import { Line } from '../../../../../../core/models/setups/line/line';
import { Box } from '../../../../../../core/models/setups/box/box';
import { ValidateManualLocationRequest } from '../../../../../../core/models/picking/picking';
import Swal, { SweetAlertResult } from 'sweetalert2';

@Component({
  selector: 'app-start-picking',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './start-picking.html',
  styleUrl: './start-picking.scss'
})
export class StartPicking implements OnInit {
  private skuService = inject(SkuService);
  private pickingService = inject(PickingService);
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private blockService = inject(BlockService);
  private archService = inject(ArchService);
  private lineService = inject(LineService);
  private boxService = inject(BoxService);

  private errorHandler = inject(ErrorHandlerService);
  private toastr = inject(ToastrService);
  private route = inject(ActivatedRoute);

  selectedSku = signal('');
  pickerName = signal('');
  kuValue = signal('KU');
  editingPickingNo = signal('');

  qty = signal<number | null>(null);

  pickingStock = signal(0);
  stock = signal(0);

  isLoading = signal(false);
  showManualModal = signal(false);

  results = signal<any[]>([]);
  skus = signal<Sku[]>([]);
  units = signal<SkuSetting[]>([]);
  users = signal<UserManage[]>([]);

  blocks = signal<Block[]>([]);
  archs = signal<Arch[]>([]);
  lines = signal<Line[]>([]);
  boxes = signal<Box[]>([]);

  modalSkuCode = signal('');
  modalBlockId = signal('');
  modalArchId = signal('');
  modalLineId = signal('');
  modalLocationCode = signal('');
  modalPickerName = signal('');

  listSkuDTO = signal<any[]>([]);
  compareSkuDTOList = signal<any[]>([]);
  tempManualLocations = signal<any[]>([]);

  ngOnInit(): void {
    this.results.set([]);
    this.loadSkus();
    this.loadSkuSettings();
    this.loadUsers();
    this.loadBlocks();

    const loggedInUser = this.authService.getLocalStorageUserName();
    if (loggedInUser) {
      this.pickerName.set(loggedInUser);
    }

    const pickingNoParam = this.route.snapshot.queryParams['pickingNo'];
    if (pickingNoParam) {
      this.loadTempProgress(pickingNoParam);
    }
  }

  onSkuChange(skuCode: string): void {
    this.selectedSku.set(skuCode);

    if (!skuCode) {
      this.pickingStock.set(0);
      this.stock.set(0);
      return;
    }

    const selectedUnitName = this.kuValue();
    const selectedSetting = this.units().find(u => u.name === selectedUnitName);
    const settingQty = selectedSetting ? selectedSetting.qty : 0;

    this.pickingService.getCurrentStock(skuCode, settingQty).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          if (Array.isArray(res.data)) {
            if (res.data.length > 0) {
              const firstItem = res.data[0];
              this.pickingStock.set(firstItem.pickingAreaStock || 0);
              this.stock.set(firstItem.totalStock || 0);
            } else {
              this.pickingStock.set(0);
              this.stock.set(0);
            }
          } else {
            this.pickingStock.set(res.data.pickingAreaStock || 0);
            this.stock.set(res.data.totalStock || 0);
          }
        } else {
          this.pickingStock.set(0);
          this.stock.set(0);
          this.toastr.info('No stock data available for the selected SKU.', 'Info');
        }
      },
      error: (err) => {
        this.errorHandler.handleErrorWithToster(err);
        this.pickingStock.set(0);
        this.stock.set(0);
      }
    });
  }

  private loadSkus(): void {
    this.skuService.getAll().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.skus.set(res.data);
        } else {
          this.toastr.error(res.message || 'Failed to load SKUs.', 'Error');
        }
      },
      error: (err) => {
        this.errorHandler.handleErrorWithToster(err);
      }
    });
  }

  private loadSkuSettings(): void {
    this.skuService.getSetting().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.units.set(res.data);
          if (res.data.length > 0) {
            this.kuValue.set(res.data[0].name);
          }
        } else {
          this.toastr.error(res.message || 'Failed to load Sku settings.', 'Error');
        }
      },
      error: (err) => {
        this.errorHandler.handleErrorWithToster(err);
      }
    });
  }

  private loadUsers(): void {
    this.userService.getAll().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.users.set(res.data.filter(u => u.active));
        } else {
          this.toastr.error(res.message || 'Failed to load users.', 'Error');
        }
      },
      error: (err) => {
        this.errorHandler.handleErrorWithToster(err);
      }
    });
  }

  onAdd() {
    if (!this.selectedSku()) {
      this.toastr.warning('Please select a Source SKU first.', 'Warning');
      return;
    }
    if (!this.qty() || this.qty()! <= 0) {
      this.toastr.warning('Please enter a valid quantity.', 'Warning');
      return;
    }
    if (!this.pickerName()) {
      this.toastr.warning('Please select a Picker Name.', 'Warning');
      return;
    }

    const selectedUnitName = this.kuValue();
    const selectedSetting = this.units().find(u => u.name === selectedUnitName);
    const settingQty = selectedSetting ? selectedSetting.qty : 0;

    const payload = {
      skuCode: this.selectedSku(),
      qty: this.qty() || 0,
      settingQty: settingQty,
      pickingNo: ""
    };

    this.isLoading.set(true);
    this.pickingService.generate(payload).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res.success && res.data) {
          const list = res.data.recommendedLocations || [];

          // Ensure all recommended locations have validation fields filled
          const validatedList = list.map((item: any) => ({
            ...item,
            shift: item.shift,
            fromBoxId: item.boxId,
            pickingNo: item.pickingNo,
            createDate: item.createDate,
            pickerName: item.pickerName
          }));

          //convert to CS
          let cs = (this.qty() || 0) / settingQty;
          cs = this.pickingStock() > 0 ? cs - this.pickingStock() : cs;

          // Remove existing items with the same SkuCode from compareSkuDTOList
          let compareList = this.compareSkuDTOList().filter((x: any) => x.skuCode !== this.selectedSku());

          // Add new SkuDTO summary / recommended item(s) mapped to validated fields
          compareList.push({
            skuCode: this.selectedSku(),
            qty: cs,
            requiredQty: this.qty() || 0,
            currentPickingQty: this.pickingStock(),
            shift: '',
            fromBoxId: '',
            pickingNo: this.editingPickingNo() || '',
            createDate: new Date().toISOString(),
            pickerName: this.pickerName() || '',
            controlName: '',
            palletNo: '',
            skuname: this.skus().find(s => s.skucode === this.selectedSku())?.skuname || '',
            rcvDate: new Date().toISOString(),
            boxId: '',
            isActive: true,
            fullPaletQty: 0,
            restQty: 0,
            settingQty: settingQty,
            pickingAreaStock: this.pickingStock(),
            totalStock: this.stock(),
            palletQty: 0,
            deliverQty: 0,
            slno: 0,
            deliverQtyOld: 0,
            transferBlock: true,
            blockQty: 0
          });

          this.listSkuDTO.set(validatedList);
          this.compareSkuDTOList.set(compareList);

          const mapped = list.map((item: any) => ({
            ...item,
            skuId: item.skuCode,
            skuName: item.skuname,
            location: item.controlName,
            qtyPerPallet: item.palletQty,
            pickingQty: item.qty,
            palletInDate: item.rcvDate
          }));
          this.results.set(mapped);
          this.toastr.success(res.message || 'Items generated successfully.', 'Success');
        } else {
          this.toastr.error(res.message || 'Failed to generate picking items.', 'Error');
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorHandler.handleErrorWithToster(err);
      }
    });
  }

  onManualAdd() {
    this.modalSkuCode.set(this.selectedSku());
    this.modalPickerName.set(this.pickerName());
    this.modalBlockId.set('');
    this.modalArchId.set('');
    this.modalLineId.set('');
    this.modalLocationCode.set('');

    this.archs.set([]);
    this.lines.set([]);
    this.boxes.set([]);
    this.tempManualLocations.set([]);

    this.showManualModal.set(true);
  }

  loadBlocks(): void {
    this.blockService.getAll().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.blocks.set(res.data);
        } else {
          this.toastr.error(res.message || 'Failed to load blocks.', 'Error');
        }
      },
      error: (err) => {
        this.errorHandler.handleErrorWithToster(err);
      }
    });
  }

  onModalSkuChange(skuCode: string): void {
    this.modalSkuCode.set(skuCode);
    this.modalBlockId.set('');
    this.modalArchId.set('');
    this.modalLineId.set('');
    this.modalLocationCode.set('');
    this.archs.set([]);
    this.lines.set([]);
    this.boxes.set([]);
  }

  onModalBlockChange(blockId: string): void {
    this.modalBlockId.set(blockId);
    this.modalArchId.set('');
    this.modalLineId.set('');
    this.modalLocationCode.set('');
    this.archs.set([]);
    this.lines.set([]);
    this.boxes.set([]);

    if (blockId) {
      this.archService.getByBlockId(blockId).subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.archs.set(res.data);
          } else {
            this.toastr.error(res.message || 'Failed to load arches.', 'Error');
          }
        },
        error: (err) => {
          this.errorHandler.handleErrorWithToster(err);
        }
      });
    }
  }

  onModalArchChange(archId: string): void {
    this.modalArchId.set(archId);
    this.modalLineId.set('');
    this.modalLocationCode.set('');
    this.lines.set([]);
    this.boxes.set([]);

    if (archId) {
      this.lineService.getAllByArch(archId).subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.lines.set(res.data);
          } else {
            this.toastr.error(res.message || 'Failed to load lines.', 'Error');
          }
        },
        error: (err) => {
          this.errorHandler.handleErrorWithToster(err);
        }
      });
    }
  }

  onModalLineChange(lineId: string): void {
    this.modalLineId.set(lineId);
    this.modalLocationCode.set('');
    this.boxes.set([]);

    if (lineId) {
      this.boxService.getBySkuCodeAndLineId(this.modalSkuCode(), lineId).subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.boxes.set(res.data);
          } else {
            this.toastr.error(res.message || 'Failed to load locations.', 'Error');
          }
        },
        error: (err) => {
          this.errorHandler.handleErrorWithToster(err);
        }
      });
    }
  }

  onModalAddClick(): void {
    if (!this.modalSkuCode()) {
      this.toastr.warning('Please select a SKU.', 'Warning');
      return;
    }
    if (!this.modalLocationCode()) {
      this.toastr.warning('Please select a Location.', 'Warning');
      return;
    }
    if (!this.modalPickerName()) {
      this.toastr.warning('Please select a Picker Name.', 'Warning');
      return;
    }

    const selectedLoc = this.modalLocationCode();
    const exists = this.tempManualLocations().some(
      item => item.skuCode === this.modalSkuCode() && item.controlName === selectedLoc
    );

    if (exists) {
      this.toastr.warning('This location has already been added to the list.', 'Warning');
      return;
    }

    // Add locally to the grid list
    this.tempManualLocations.update(current => [
      ...current,
      {
        skuCode: this.modalSkuCode(),
        controlName: selectedLoc,
        qty: this.qty() || 0
      }
    ]);

    this.toastr.success('Location added to the local list.', 'Success');
  }

  removeModalLocation(index: number): void {
    const list = [...this.tempManualLocations()];
    list.splice(index, 1);
    this.tempManualLocations.set(list);
    this.toastr.success('Location removed from the manual list.', 'Success');
  }

  confirmAndSaveManualLocations(): void {
    debugger;
    if (this.tempManualLocations().length === 0) {
      this.showManualModal.set(false);
      return;
    }

    Swal.fire({
      title: 'You want to save it?',
      text: 'Do you want to validate and save the selected manual locations?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#00BB31',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes',
      cancelButtonText: 'No'
    }).then((result: SweetAlertResult) => {
      if (result.isConfirmed) {
        this.executeManualValidation();
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        this.showManualModal.set(false);
      }
    });
  }

  executeManualValidation(): void {
    const selectedUnitName = this.kuValue();
    const selectedSetting = this.units().find(u => u.name === selectedUnitName);
    const settingQty = selectedSetting ? selectedSetting.qty : 0;

    const lastLoc = this.tempManualLocations().length > 0
      ? this.tempManualLocations()[this.tempManualLocations().length - 1].controlName
      : '';

    // Map listSkuDTO and compareSkuDTOList to ensure shift, fromBoxId, pickingNo, createDate, and pickerName are non-null
    const mappedListSkuDTO = this.listSkuDTO().map((item: any) => ({
      ...item,
      shift: item.shift || '',
      fromBoxId: item.boxId || item.fromBoxId || '',
      pickingNo: item.pickingNo || this.editingPickingNo() || '',
      createDate: item.createDate || new Date().toISOString(),
      pickerName: item.pickerName || this.pickerName() || ''
    }));

    const mappedCompareSkuDTOList = this.compareSkuDTOList().map((item: any) => ({
      ...item,
      shift: item.shift || '',
      fromBoxId: item.boxId || item.fromBoxId || '',
      pickingNo: item.pickingNo || this.editingPickingNo() || '',
      createDate: item.createDate || new Date().toISOString(),
      pickerName: item.pickerName || this.pickerName() || ''
    }));

    const payload: ValidateManualLocationRequest = {
      controlName: lastLoc,
      batchNo: '',
      rcvDate: new Date().toISOString(),
      skuCode: this.modalSkuCode(),
      qty: this.qty() || 0,
      settingQty: settingQty,
      listSkuDTO: mappedListSkuDTO,
      compareSkuDTOList: mappedCompareSkuDTOList,
      manualLocationList: this.tempManualLocations().map(item => item.controlName)
    };

    this.isLoading.set(true);
    this.pickingService.validateManualLocation(payload).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res.success && res.data) {
          const apiData = res.data as any;
          const list = apiData && Array.isArray(apiData.listSkuDTO) ? apiData.listSkuDTO : [];

          this.listSkuDTO.set(list);
          this.compareSkuDTOList.set(list);

          const mapped = list.map((item: any) => ({
            ...item,
            skuId: item.skuCode,
            skuName: item.skuname,
            location: item.controlName,
            qtyPerPallet: item.palletQty,
            pickingQty: item.qty,
            palletInDate: item.rcvDate
          }));
          this.results.set(mapped);

          if (this.modalPickerName() !== this.pickerName()) {
            this.pickerName.set(this.modalPickerName());
          }

          if (apiData && apiData.errorMessage) {
            this.toastr.warning(apiData.errorMessage, 'Warning');
          } else {
            this.toastr.success(res.message || 'Locations validated and added successfully.', 'Success');
          }
          this.showManualModal.set(false);
        } else {
          this.toastr.error(res.message || 'Failed to validate/add locations.', 'Error');
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorHandler.handleErrorWithToster(err);
      }
    });
  }

  onDelete(index: number) {
    const list = [...this.results()];
    list.splice(index, 1);
    this.results.set(list);

    const updatedRaw = [...this.listSkuDTO()];
    updatedRaw.splice(index, 1);
    this.listSkuDTO.set(updatedRaw);
    this.compareSkuDTOList.set(updatedRaw);

    this.toastr.success('Item removed from list.', 'Success');
  }

  private savePayload(payload: any): void {
    this.pickingService.save(payload).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res.success) {
          this.toastr.success(res.message || 'Picking list saved successfully.', 'Success');
          this.results.set([]);
          this.listSkuDTO.set([]);
          this.compareSkuDTOList.set([]);
          this.qty.set(null);
          this.selectedSku.set('');
          this.pickingStock.set(0);
          this.stock.set(0);
          this.editingPickingNo.set('');
        } else {
          this.toastr.error(res.message || 'Failed to save picking list.', 'Error');
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorHandler.handleErrorWithToster(err);
      }
    });
  }

  onSave() {
    if (this.results().length === 0) {
      this.toastr.warning('No items to save.', 'Warning');
      return;
    }
    if (!this.pickerName()) {
      this.toastr.warning('Please select a Picker Name.', 'Warning');
      return;
    }

    const editNo = this.editingPickingNo();

    const items = this.results().map(item => ({
      controlName: item.controlName || '',
      palletNo: item.palletNo || '',
      skuname: item.skuname || '',
      skuCode: item.skuCode || '',
      palletQty: item.palletQty || 0,
      fullPaletQty: item.fullPaletQty || 0,
      restQty: item.restQty || 0,
      requiredQty: item.requiredQty || 0,
      currentPickingQty: item.currentPickingQty || 0,
      pickerName: this.pickerName(),
      settingQty: item.settingQty || 0,
      pickingNo: editNo ? editNo : ''
    }));

    const payload = {
      items: items,
      pickerName: this.pickerName(),
      pickingNo: editNo ? editNo : ''
    };

    this.isLoading.set(true);

    if (editNo) {
      this.pickingService.deleteProgress(editNo).subscribe({
        next: (res) => {
          if (res.success) {
            this.savePayload(payload);
          } else {
            this.isLoading.set(false);
            this.toastr.error(res.message || 'Failed to clean up prior picking progress.', 'Error');
          }
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorHandler.handleErrorWithToster(err);
        }
      });
    } else {
      // Save directly
      this.savePayload(payload);
    }
  }

  private loadTempProgress(pickingNo: string): void {
    this.isLoading.set(true);
    this.pickingService.getTempProgress(pickingNo).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res.success && res.data) {
          const list = Array.isArray(res.data) ? res.data : [res.data];

          let listSkuDTOTemp = [...list];
          const compareSkuDTOListTemp: any[] = [];
          let currentSkuCode = '';

          for (const item of list) {
            if (currentSkuCode !== item.skuCode) {
              if (listSkuDTOTemp.length > 0) {
                listSkuDTOTemp = listSkuDTOTemp.filter(x => x.skuCode !== item.skuCode);
              }
              const qty = list
                .filter(x => x.skuCode === item.skuCode)
                .reduce((sum, x) => sum + (x.fullPaletQty || 0), 0);

              compareSkuDTOListTemp.push({
                skuCode: item.skuCode,
                qty: qty,
                requiredQty: item.requiredQty,
                currentPickingQty: item.currentPickingQty
              });
            }
            currentSkuCode = item.skuCode;
          }

          this.listSkuDTO.set(listSkuDTOTemp);
          this.compareSkuDTOList.set(compareSkuDTOListTemp);

          const mapped = list.map((item: any) => ({
            ...item,
            skuId: item.skuCode,
            skuName: item.skuname,
            location: item.controlName,
            qtyPerPallet: item.palletQty,
            pickingQty: item.qty,
            palletInDate: item.rcvDate
          }));
          this.results.set(mapped);
          this.editingPickingNo.set(pickingNo);

          if (list.length > 0 && list[0].pickerName) {
            this.pickerName.set(list[0].pickerName);
          }
        } else {
          this.toastr.error(res.message || 'Failed to load temp progress.', 'Error');
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorHandler.handleErrorWithToster(err);
      }
    });
  }
}
