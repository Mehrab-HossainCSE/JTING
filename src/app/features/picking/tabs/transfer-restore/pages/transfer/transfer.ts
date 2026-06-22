import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-transfer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './transfer.html',
  styleUrl: './transfer.scss'
})
export class Transfer implements OnInit {
  palletNo = signal('');
  boxId = signal('');
  sourceLocation = signal('');
  destLocation = signal('');
  selectedSku = signal('');
  transferQty = signal<number | null>(null);

  isLoading = signal(false);

  skuList = signal<{ skuCode: string, skuName: string }[]>([
    { skuCode: 'SKU-001', skuName: 'Item Alpha Premium' },
    { skuCode: 'SKU-002', skuName: 'Item Beta Standard' },
    { skuCode: 'SKU-003', skuName: 'Item Gamma Deluxe' },
  ]);

  ngOnInit(): void {}

  onConfirmTransfer() {
    console.log('Transfer confirmed', {
      palletNo: this.palletNo(),
      boxId: this.boxId(),
      sourceLocation: this.sourceLocation(),
      destLocation: this.destLocation(),
      selectedSku: this.selectedSku(),
      transferQty: this.transferQty(),
    });
  }

  onReset() {
    this.palletNo.set('');
    this.boxId.set('');
    this.sourceLocation.set('');
    this.destLocation.set('');
    this.selectedSku.set('');
    this.transferQty.set(null);
  }
}
