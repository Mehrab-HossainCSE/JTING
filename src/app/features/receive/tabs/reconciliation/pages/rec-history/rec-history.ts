import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-rec-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './rec-history.html',
  styleUrls: ['../../reconciliation.scss']
})
export class RecHistory {
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
  uploadFile(): void { this.toastr.info('Searching reconciliation history...', 'History'); }
  clearData(): void { }
  saveData(): void { }
  printResults(): void { }
}
