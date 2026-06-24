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
  results = signal<any[]>([]);
  skus = signal<Sku[]>([]);
  units = signal<SkuSetting[]>([]);
  users = signal<UserManage[]>([]);
  showManualModal = signal(false);

  ngOnInit(): void {
    this.results.set([]);
    this.loadSkus();
    this.loadSkuSettings();
    this.loadUsers();

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
    debugger;
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
    this.showManualModal.set(true);
  }

  onDelete(index: number) {
    const list = [...this.results()];
    list.splice(index, 1);
    this.results.set(list);
    this.toastr.success('Item removed from list.', 'Success');
  }

  private savePayload(payload: any): void {
    this.pickingService.save(payload).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res.success) {
          this.toastr.success(res.message || 'Picking list saved successfully.', 'Success');
          this.results.set([]);
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
      // First delete progress then save
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
