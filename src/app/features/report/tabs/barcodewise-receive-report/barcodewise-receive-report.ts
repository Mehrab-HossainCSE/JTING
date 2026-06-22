import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-barcodewise-receive-report',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './barcodewise-receive-report.html',
  styleUrl: './barcodewise-receive-report.scss'
})
export class BarcodewiseReceiveReport implements OnInit {
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
      {"col0":"BAR-1002931","col1":"SKU-001","col2":"Item Alpha Premium","col3":"GRN-001","col4":"PLT-101","col5":"06/22/2026","col6":"100"},
      {"col0":"BAR-2003841","col1":"SKU-002","col2":"Item Beta Standard","col3":"GRN-002","col4":"PLT-102","col5":"06/22/2026","col6":"50"}
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
