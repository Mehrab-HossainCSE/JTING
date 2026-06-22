import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-picking-report',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './picking-report.html',
  styleUrl: './picking-report.scss'
})
export class PickingReport implements OnInit {
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
      {"col0":"PK-2026-001","col1":"06/22/2026","col2":"Mr. ms","col3":"5","col4":"120","col5":"Completed"},
      {"col0":"PK-2026-002","col1":"06/22/2026","col2":"John Doe","col3":"3","col4":"80","col5":"In Progress"}
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
