import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-warehouse-capacity-report',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './warehouse-capacity-report.html',
  styleUrl: './warehouse-capacity-report.scss'
})
export class WarehouseCapacityReport implements OnInit {
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
      {"col0":"Zone A","col1":"500","col2":"420","col3":"80","col4":"84%"},
      {"col0":"Zone B","col1":"300","col2":"150","col3":"150","col4":"50%"}
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
