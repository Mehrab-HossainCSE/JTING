import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-picking-area-report',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './picking-area-report.html',
  styleUrl: './picking-area-report.scss'
})
export class PickingAreaReport implements OnInit {
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
      {"col0":"PA-01","col1":"A-02-B","col2":"SKU-001","col3":"PLT-202","col4":"350","col5":"Active"},
      {"col0":"PA-02","col1":"B-05-A","col2":"SKU-003","col3":"PLT-404","col4":"120","col5":"Active"}
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
