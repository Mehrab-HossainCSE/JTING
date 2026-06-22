import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-delivery-report',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './delivery-report.html',
  styleUrl: './delivery-report.scss'
})
export class DeliveryReport implements OnInit {
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
      {"col0":"06/22/2026","col1":"DLV-101","col2":"TRK-1002","col3":"Alex Rodriguez","col4":"Client Corp","col5":"24","col6":"Dispatched"},
      {"col0":"06/22/2026","col1":"DLV-102","col2":"TRK-2041","col3":"John Smith","col4":"Retail Inc","col5":"12","col6":"Dispatched"}
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
