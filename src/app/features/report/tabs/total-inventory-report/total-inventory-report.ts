import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-total-inventory-report',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './total-inventory-report.html',
  styleUrl: './total-inventory-report.scss'
})
export class TotalInventoryReport implements OnInit {
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
      {"col0":"SKU-001","col1":"Item Alpha Premium","col2":"1200","col3":"350","col4":"0","col5":"1550"},
      {"col0":"SKU-002","col1":"Item Beta Standard","col2":"800","col3":"120","col4":"50","col5":"970"}
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
