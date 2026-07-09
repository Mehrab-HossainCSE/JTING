import { Component, OnInit, WritableSignal, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { TruckService } from '../../../../core/services/setupServices/truck-service';
import { DriverService } from '../../../../core/services/setupServices/driver-service';
import { DestinationService } from '../../../../core/services/setupServices/destination-service';
import { SkuService } from '../../../../core/services/skuServices/sku-service';
import { DeliveryService } from '../../../../core/services/deliveryServices/delivery.service';
import { Truck } from '../../../../core/models/setups/truck/truck';
import { Driver } from '../../../../core/models/setups/driver/driver';
import { Destination } from '../../../../core/models/setups/destination/destination';
import { SkuSetting } from '../../../../core/models/setups/sku/sku-setting';
import { LoaderService } from '../../../../core/services/loader.service';
import {
  ScanBarcodeRequest, DeliveryTempItem, UpdateQtyRequest,
  SaveDeliveryRequest, SummaryItem, DataItem
} from '../../../../core/models/delivery/delivery.model';

import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-delivery-tab',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './delivery.html',
  styleUrl: './delivery.scss'
})
export class Delivery implements OnInit {

  private readonly truckService = inject(TruckService);
  private readonly driverService = inject(DriverService);
  private readonly destinationService = inject(DestinationService);
  private readonly skuService = inject(SkuService);
  private readonly deliveryService = inject(DeliveryService);
  private readonly loaderService = inject(LoaderService);
  private readonly toastr = inject(ToastrService);

  forwarder = signal('');
  poNo = signal('');
  carrier = signal('');
  containerNo = signal('');
  bookingNo = signal('');
  contactNo = signal('');
  candf = signal('');
  lockNo = signal('');
  dcNo = signal('');

  challanNo = signal('');
  salesOrder = signal('');

  truck = signal('');
  truckId = signal('');

  driver = signal('');
  driverId = signal('');

  destination = signal('');
  destinationId = signal('');

  barcode = signal('');
  qty = signal(0);

  uomSelectId = signal<number>(0);
  skuSettings = signal<SkuSetting[]>([]);

  batchNo = signal('');
  batchQty = signal('');
  searchText = signal('');
  selectedBarcode = signal<string | null>(null);

  truckOptions = signal<Truck[]>([]);
  driverOptions = signal<Driver[]>([]);
  destinationOptions = signal<Destination[]>([]);

  truckOpen = signal(false);
  driverOpen = signal(false);
  destinationOpen = signal(false);

  filteredTrucks = computed(() => {
    const q = this.truck().toLowerCase();
    return q
      ? this.truckOptions().filter(t => t.truckName.toLowerCase().includes(q))
      : this.truckOptions();
  });

  filteredDrivers = computed(() => {
    const q = this.driver().toLowerCase();
    return q
      ? this.driverOptions().filter(d => d.driverName.toLowerCase().includes(q))
      : this.driverOptions();
  });

  filteredDestinations = computed(() => {
    const q = this.destination().toLowerCase();
    return q
      ? this.destinationOptions().filter(d => d.destinationName.toLowerCase().includes(q))
      : this.destinationOptions();
  });

  scannedCount = signal(0);

  summaryList = signal<SummaryItem[]>([]);
  dataList = signal<DataItem[]>([]);

  isLoading = signal(false);

  ngOnInit(): void {
    this.loadDropdownData();
  }

  loadDropdownData(): void {
    this.isLoading.set(true);
    this.loaderService.show('Loading delivery details...');
    forkJoin({
      trucks: this.truckService.getAll(),
      drivers: this.driverService.getAll(),
      destinations: this.destinationService.getAll(),
      skuSettings: this.skuService.getSetting()
    }).subscribe({
      next: ({ trucks, drivers, destinations, skuSettings }) => {
        if (trucks.success) this.truckOptions.set(trucks.data);
        if (drivers.success) this.driverOptions.set(drivers.data);
        if (destinations.success) this.destinationOptions.set(destinations.data);
        if (skuSettings.success) {
          this.skuSettings.set(skuSettings.data);
          const kuDefault = skuSettings.data.find(s => s.name === 'KU');
          if (kuDefault) {
            this.uomSelectId.set(kuDefault.id);
            this.qty.set(kuDefault.qty);
            this.loadTempProgress(kuDefault.qty, kuDefault.name);
          } else {
            this.loaderService.hide();
          }
        } else {
          this.loaderService.hide();
        }
      },
      error: (err) => {
        console.error('Failed to load dropdown data:', err);
        this.isLoading.set(false);
        this.loaderService.hide();
      },
      complete: () => {
        this.isLoading.set(false);
      }
    });
  }

  private updateLists(summary: DeliveryTempItem[], details: DeliveryTempItem[]): void {
    if (summary) {
      this.summaryList.set(summary.map(item => ({
        id: item.id,
        skucode: item.skucode,
        skuname: item.skuname,
        uom: item.uom,
        qty: item.qty,
        remarks: item.remarks
      })));
    }
    if (details) {
      this.dataList.set(details.map(item => ({
        barcode: item.barcode ?? '',
        skucode: item.skucode,
        skuname: item.skuname,
        uom: item.uom,
        qty: item.qty,
        editQty: item.qty
      })));
    }
    this.updateScannedCount();
  }

  loadTempProgress(settingQty: number, settingText: string): void {
    this.loaderService.show('Loading scan progress...');
    this.deliveryService.getTempProgress(settingQty, settingText).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          console.log('Temp progress loaded:', res.data);
          this.updateLists(res.data.summary, res.data.details);
        }
        this.loaderService.hide();
      },
      error: (err) => {
        console.error('Failed to load temp progress:', err);
        this.loaderService.hide();
      }
    });
  }

  onUomChange(id: number): void {
    this.uomSelectId.set(+id);
    const setting = this.skuSettings().find(s => s.id === +id);
    if (setting) this.qty.set(setting.qty);
  }

  selectTruck(truck: Truck): void {
    this.truck.set(truck.truckName);
    this.truckId.set(truck.truckId);
    this.truckOpen.set(false);
  }

  selectDriver(driver: Driver): void {
    this.driver.set(driver.driverName);
    this.driverId.set(driver.driverId);
    this.driverOpen.set(false);
  }

  selectDestination(dest: Destination): void {
    this.destination.set(dest.destinationName);
    this.destinationId.set(dest.destinationId);
    this.destinationOpen.set(false);
  }

  closeDropdownLater(openSignal: WritableSignal<boolean>): void {
    setTimeout(() => openSignal.set(false), 150);
  }

  updateScannedCount(): void {
    this.scannedCount.set(this.dataList().length);
  }

  onBarcodeEnter(isOverride = false): void {
    const code = this.barcode().trim();
    if (!code) {
      this.toastr.warning('Please enter or scan a barcode.', 'Warning');
      return;
    }

    const selectedSetting = this.skuSettings().find(s => s.id === this.uomSelectId());
    const settingText = selectedSetting ? selectedSetting.name : '';

    const payload: ScanBarcodeRequest = {
      barcode: code,
      batchNo: this.batchNo().trim(),
      batchQty: Number(this.batchQty()) || 0,
      settingQty: this.qty() || 0,
      settingText: settingText,
      driverId: this.driverId(),
      driverName: this.driver(),
      truckId: this.truckId(),
      truckName: this.truck(),
      destinationId: this.destinationId(),
      destinationName: this.destination(),
      challanNo: this.challanNo().trim(),
      salesOrder: this.salesOrder().trim(),
      isWithoutPickingOverride: isOverride
    };

    this.loaderService.show('Scanning barcode...');
    this.deliveryService.scan(payload).subscribe({
      next: (res) => {
        this.loaderService.hide();
        if (res.success && res.data) {
          const scanData = res.data;

          if (scanData.requiresPickingOverride) {
            Swal.fire({
              title: 'Requires Picking Override',
              text: scanData.message || 'This item requires a picking override. Do you want to scan it without picking?',
              icon: 'warning',
              showCancelButton: true,
              confirmButtonColor: '#00bb31',
              cancelButtonColor: '#d33',
              confirmButtonText: 'Yes, scan with override',
              cancelButtonText: 'No'
            }).then((result) => {
              if (result.isConfirmed) {
                this.onBarcodeEnter(true);
              }
            });
            return;
          }

          if (scanData.isSuccess) {
            this.updateLists(scanData.summary, scanData.details);
            this.toastr.success(scanData.message || 'Barcode scanned successfully.', 'Success');
            this.barcode.set('');
          } else {
            this.toastr.error(scanData.message || 'Failed to scan barcode.', 'Error');
          }
        } else {
          this.toastr.error(res.message || 'Failed to scan barcode.', 'Error');
        }
      },
      error: (err) => {
        this.loaderService.hide();
        console.error('Scan API failed:', err);
        this.toastr.error(err?.error?.message || 'Error occurred during barcode scan.', 'Error');
      }
    });
  }

  onDelete(item: DataItem): void {
    const selectedSetting = this.skuSettings().find(s => s.id === this.uomSelectId());
    const settingText = selectedSetting ? selectedSetting.name : '';
    const settingQty = this.qty() || 0;

    Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to delete this scanned item: ${item.barcode}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.loaderService.show('Deleting scanned item...');
        this.deliveryService.deleteTemp(item.barcode, settingQty, settingText).subscribe({
          next: (res) => {
            this.loaderService.hide();
            if (res.success && res.data) {
              this.updateLists(res.data.summary, res.data.details);
              this.toastr.success(res.message || 'Item deleted successfully.', 'Success');
            } else {
              this.toastr.error(res.message || 'Failed to delete item.', 'Error');
            }
          },
          error: (err) => {
            this.loaderService.hide();
            console.error('Delete API failed:', err);
            this.toastr.error(err?.error?.message || 'Error occurred while deleting.', 'Error');
          }
        });
      }
    });
  }

  onUpdateQty(item: DataItem): void {
    if (item.qty === item.editQty) {
      return;
    }

    if (item.editQty === null || item.editQty === undefined || item.editQty <= 0) {
      this.toastr.warning('Quantity must be greater than zero.', 'Warning');
      item.editQty = item.qty;
      this.updateScannedCount();
      return;
    }

    const selectedSetting = this.skuSettings().find(s => s.id === this.uomSelectId());
    const settingText = selectedSetting ? selectedSetting.name : '';
    const settingQty = this.qty() || 0;

    const payload: UpdateQtyRequest = {
      barcode: item.barcode,
      skuCode: item.skucode,
      qty: item.editQty,
      settingQty: settingQty,
      settingText: settingText
    };

    this.loaderService.show('Updating quantity...');
    this.deliveryService.updateQty(payload).subscribe({
      next: (res) => {
        this.loaderService.hide();
        if (res.success && res.data) {
          this.updateLists(res.data.summary, res.data.details);
          this.toastr.success(res.message || 'Quantity updated successfully.', 'Success');
        } else {
          item.editQty = item.qty;
          this.updateScannedCount();
          this.toastr.error(res.message || 'Failed to update quantity.', 'Error');
        }
      },
      error: (err) => {
        this.loaderService.hide();
        item.editQty = item.qty;
        this.updateScannedCount();
        console.error('Update qty API failed:', err);
        this.toastr.error(err?.error?.message || 'Error occurred while updating quantity.', 'Error');
      }
    });
  }

  onSearchTextChange(value: string): void {
    this.searchText.set(value);
    const searchValue = value.trim().toLowerCase();

    if (!searchValue) {
      this.selectedBarcode.set(null);
      return;
    }

    for (const item of this.dataList()) {
      let isMatch = false;

      if (
        (item.barcode && item.barcode.toLowerCase().includes(searchValue)) ||
        (item.skucode && item.skucode.toLowerCase().includes(searchValue)) ||
        (item.skuname && item.skuname.toLowerCase().includes(searchValue)) ||
        (item.uom && item.uom.toLowerCase().includes(searchValue)) ||
        String(item.qty).toLowerCase().includes(searchValue)
      ) {
        isMatch = true;
      }

      if (!isMatch && item.barcode && item.barcode.length >= 34) {
        const sequenceNo = item.barcode.substring(28, 34);
        if (sequenceNo.toLowerCase() === searchValue) {
          isMatch = true;
        }
      }

      if (isMatch) {
        this.selectedBarcode.set(item.barcode);
        setTimeout(() => {
          const el = document.getElementById(`row-${item.barcode}`);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        }, 50);
        return;
      }
    }

    this.selectedBarcode.set(null);
  }

  onSearch(): void {
    this.onSearchTextChange(this.searchText());
  }

  onRePrint(): void {
    console.log('Re-printing DC No:', this.dcNo());
  }

  onPreview(): void {
    console.log('Previewing Delivery. Form data:', this.getFormData());
  }

  onSave(): void {
    if (this.dataList().length === 0) {
      this.toastr.warning('Cannot save delivery without scanned items.', 'Warning');
      return;
    }

    if (!this.challanNo().trim()) {
      this.toastr.warning('Challan No is required.', 'Warning');
      return;
    }

    if (!this.truckId() || !this.truck()) {
      this.toastr.warning('Please select a truck.', 'Warning');
      return;
    }

    if (!this.driverId() || !this.driver()) {
      this.toastr.warning('Please select a driver.', 'Warning');
      return;
    }

    if (!this.destinationId() || !this.destination()) {
      this.toastr.warning('Please select a destination.', 'Warning');
      return;
    }

    const payload: SaveDeliveryRequest = {
      driverId: this.driverId(),
      driverName: this.driver(),
      truckId: this.truckId(),
      truckName: this.truck(),
      destinationId: this.destinationId(),
      destinationName: this.destination(),
      challanNo: this.challanNo().trim(),
      salesOrder: this.salesOrder().trim(),
      forwarded: this.forwarder().trim(),
      carrier: this.carrier().trim(),
      bookingNo: this.bookingNo().trim(),
      candF: this.candf().trim(),
      po: this.poNo().trim(),
      containerNo: this.containerNo().trim(),
      contactNo: this.contactNo().trim(),
      lockNo: this.lockNo().trim()
    };

    this.loaderService.show('Saving delivery...');
    this.deliveryService.save(payload).subscribe({
      next: (res) => {
        this.loaderService.hide();
        if (res.success) {
          this.toastr.success(res.message || 'Delivery saved successfully.', 'Success');
          this.resetForm();
          if (res.data) {
            this.dcNo.set(res.data);
          }
        } else {
          this.toastr.error(res.message || 'Failed to save delivery.', 'Error');
        }
      },
      error: (err) => {
        this.loaderService.hide();
        console.error('Save API failed:', err);
        this.toastr.error(err?.error?.message || 'Error occurred while saving delivery.', 'Error');
      }
    });
  }

  resetForm(): void {
    this.forwarder.set('');
    this.poNo.set('');
    this.carrier.set('');
    this.containerNo.set('');
    this.bookingNo.set('');
    this.contactNo.set('');
    this.candf.set('');
    this.lockNo.set('');
    this.dcNo.set('');
    this.challanNo.set('');
    this.salesOrder.set('');
    this.truck.set('');
    this.truckId.set('');
    this.driver.set('');
    this.driverId.set('');
    this.destination.set('');
    this.destinationId.set('');
    this.barcode.set('');
    this.batchNo.set('');
    this.batchQty.set('');
    this.searchText.set('');
    this.selectedBarcode.set(null);
    this.summaryList.set([]);
    this.dataList.set([]);

    const kuDefault = this.skuSettings().find(s => s.name === 'KU');
    if (kuDefault) {
      this.uomSelectId.set(kuDefault.id);
      this.qty.set(kuDefault.qty);
    }

    this.updateScannedCount();
  }

  onClose(): void {
    console.log('Closing Delivery Tab.');
  }

  getFormData() {
    return {
      forwarder: this.forwarder(),
      poNo: this.poNo(),
      carrier: this.carrier(),
      containerNo: this.containerNo(),
      bookingNo: this.bookingNo(),
      contactNo: this.contactNo(),
      candf: this.candf(),
      lockNo: this.lockNo(),
      dcNo: this.dcNo(),
      challanNo: this.challanNo(),
      salesOrder: this.salesOrder(),
      truckId: this.truckId(),
      truck: this.truck(),
      driverId: this.driverId(),
      driver: this.driver(),
      destinationId: this.destinationId(),
      destination: this.destination(),
      barcode: this.barcode(),
      uomSelectId: this.uomSelectId(),
      qty: this.qty(),
      batchNo: this.batchNo(),
      batchQty: this.batchQty(),
      searchText: this.searchText(),
      scannedCount: this.scannedCount()
    };
  }
}
