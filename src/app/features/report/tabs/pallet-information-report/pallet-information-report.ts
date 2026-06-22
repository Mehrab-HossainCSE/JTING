import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-pallet-information-report',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pallet-information-report.html',
  styleUrl: './pallet-information-report.scss'
})
export class PalletInformationReport implements OnInit {
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
      {"col0":"PLT-101","col1":"A-01-A","col2":"B-1001","col3":"06/22/2026","col4":"SKU-001","col5":"Item Alpha Premium","col6":"100"},
      {"col0":"PLT-102","col1":"C-04-B","col2":"B-2002","col3":"06/22/2026","col4":"SKU-002","col5":"Item Beta Standard","col6":"50"}
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
