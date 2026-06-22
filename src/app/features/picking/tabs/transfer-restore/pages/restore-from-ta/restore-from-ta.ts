import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-restore-from-ta',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './restore-from-ta.html',
  styleUrl: './restore-from-ta.scss'
})
export class RestoreFromTa implements OnInit {
  selectedSku = signal('');
  sourceTa = signal('');
  destLocation = signal('');
  restoreQty = signal<number | null>(null);
  palletNo = signal('');

  isLoading = signal(false);

  skuList = signal<{ skuCode: string, skuName: string }[]>([
    { skuCode: 'SKU-001', skuName: 'Item Alpha Premium' },
    { skuCode: 'SKU-002', skuName: 'Item Beta Standard' },
    { skuCode: 'SKU-003', skuName: 'Item Gamma Deluxe' },
  ]);

  taList = signal<{ id: string, name: string }[]>([
    { id: 'TA-01', name: 'Transition Area Section 1' },
    { id: 'TA-02', name: 'Transition Area Section 2' },
  ]);

  ngOnInit(): void {}

  onConfirmRestore() {
    console.log('Restore from TA confirmed', {
      selectedSku: this.selectedSku(),
      sourceTa: this.sourceTa(),
      destLocation: this.destLocation(),
      restoreQty: this.restoreQty(),
      palletNo: this.palletNo(),
    });
  }

  onReset() {
    this.selectedSku.set('');
    this.sourceTa.set('');
    this.destLocation.set('');
    this.restoreQty.set(null);
    this.palletNo.set('');
  }
}
