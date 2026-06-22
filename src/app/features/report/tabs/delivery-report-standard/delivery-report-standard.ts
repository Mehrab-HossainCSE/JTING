import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-delivery-report-standard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './delivery-report-standard.html',
  styleUrl: './delivery-report-standard.scss'
})
export class DeliveryReportStandard implements OnInit {
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
      {"col0":"DLV-101","col1":"06/22/2026","col2":"Warehouse West","col3":"24","col4":"Dispatched"},
      {"col0":"DLV-102","col1":"06/22/2026","col2":"Warehouse South","col3":"12","col4":"Dispatched"}
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
