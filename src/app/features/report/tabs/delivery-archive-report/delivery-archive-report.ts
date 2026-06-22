import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-delivery-archive-report',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './delivery-archive-report.html',
  styleUrl: './delivery-archive-report.scss'
})
export class DeliveryArchiveReport implements OnInit {
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
      {"col0":"ARC-001","col1":"06/15/2026","col2":"DLV-080","col3":"Warehouse East","col4":"40","col5":"Archived","col6":"06/22/2026"},
      {"col0":"ARC-002","col1":"06/10/2026","col2":"DLV-072","col3":"Warehouse South","col4":"20","col5":"Archived","col6":"06/22/2026"}
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
