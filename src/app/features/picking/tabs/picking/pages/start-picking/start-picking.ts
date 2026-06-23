import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SkuService } from '../../../../../../core/services/skuServices/sku-service';
import { PickingService } from '../../../../../../core/services/pickingServices/picking-service';
import { Sku } from '../../../../../../core/models/setups/sku/sku';
import { SkuSetting } from '../../../../../../core/models/setups/sku/sku-setting';

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

  selectedSku = signal('');
  pickerName = signal('ms');
  kuValue = signal('KU');
  qty = signal<number | null>(null);

  pickingStock = signal(0);
  stock = signal(0);

  isLoading = signal(false);
  results = signal<any[]>([]);
  skus = signal<Sku[]>([]);
  units = signal<SkuSetting[]>([]);

  ngOnInit(): void {
    this.results.set([]);
    this.loadSkus();
    this.loadSkuSettings();
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
        }
      },
      error: (err) => {
        console.error('Failed to get current stock', err);
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
        }
      },
      error: (err) => {
        console.error('Failed to load SKUs', err);
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
        }
      },
      error: (err) => {
        console.error('Failed to load Sku settings', err);
      }
    });
  }

  onAdd() {
    console.log('Add clicked');
  }

  onManualAdd() {
    console.log('Manual Add clicked');
  }

  onSave() {
    console.log('Save clicked');
  }
}
