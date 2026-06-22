import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-product-receive-report',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-receive-report.html',
  styleUrl: './product-receive-report.scss'
})
export class ProductReceiveReport implements OnInit {
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
      {"col0":"06/22/2026","col1":"PRD-001","col2":"Alpha Item","col3":"Electronics","col4":"200","col5":"PCS","col6":"A-01-A"},
      {"col0":"06/22/2026","col1":"PRD-002","col2":"Beta Item","col3":"Hardware","col4":"150","col5":"PCS","col6":"C-04-B"}
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
