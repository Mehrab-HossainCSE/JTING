import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-rec-delivery',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './rec-delivery.html',
  styleUrls: ['../../reconciliation.scss']
})
export class RecDelivery {
  private toastr = inject(ToastrService);
  permissions = signal({ canView: true, canCreate: true, canUpdate: true, canDelete: true });
  canCreate = computed(() => this.permissions().canCreate);
  fileName = signal('');
  selectedUnit = signal('CS');
  isShiftWise = signal(false);
  fromDate = signal('');
  toDate = signal('');
  receiveNo = signal('Auto-generated...');
  results = signal<any[]>([]);
  isLoading = signal(false);

  onFileSelected(event: any): void { }
  uploadFile(): void { this.toastr.info('Delivery reconciliation upload simulated.', 'Delivery'); }
  clearData(): void { }
  saveData(): void { }
  printResults(): void { }
}
