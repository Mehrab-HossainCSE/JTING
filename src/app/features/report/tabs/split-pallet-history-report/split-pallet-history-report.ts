import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-split-pallet-history-report',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './split-pallet-history-report.html',
  styleUrl: './split-pallet-history-report.scss'
})
export class SplitPalletHistoryReport implements OnInit {
  fromDate = signal(new Date().toISOString().split('T')[0]);
  toDate = signal(new Date().toISOString().split('T')[0]);
  isLoading = signal(false);
  results = signal<any[]>([]);

  ngOnInit(): void {
    this.onSearch();
  }

  onSearch() {
    this.isLoading.set(true);
    setTimeout(() => {
      this.results.set([
      {"col0":"SP-001","col1":"06/22/2026","col2":"PLT-500","col3":"PLT-500-A","col4":"PLT-500-B","col5":"50","col6":"Admin"},
      {"col0":"SP-002","col1":"06/21/2026","col2":"PLT-621","col3":"PLT-621-A","col4":"PLT-621-B","col5":"30","col6":"Supervisor"}
      ]);
      this.isLoading.set(false);
    }, 600);
  }

  onReset() {
    this.fromDate.set(new Date().toISOString().split('T')[0]);
    this.toDate.set(new Date().toISOString().split('T')[0]);
    this.results.set([]);
  }
}
