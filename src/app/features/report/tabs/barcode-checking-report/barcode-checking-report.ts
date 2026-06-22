import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-barcode-checking-report',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './barcode-checking-report.html',
  styleUrl: './barcode-checking-report.scss'
})
export class BarcodeCheckingReport implements OnInit {
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
      {"col0":"SCN-901","col1":"06/22/2026","col2":"BAR-1002931","col3":"Valid","col4":"Inspector John","col5":"OK"},
      {"col0":"SCN-902","col1":"06/22/2026","col2":"BAR-ERR-99","col3":"Invalid","col4":"Inspector John","col5":"Missing check digit"}
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
