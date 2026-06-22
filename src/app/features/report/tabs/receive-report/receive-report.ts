import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-receive-report',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './receive-report.html',
  styleUrl: './receive-report.scss'
})
export class ReceiveReport implements OnInit {
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
      {"col0":"06/22/2026","col1":"GRN-001","col2":"SKU-001","col3":"Item Alpha Premium","col4":"PLT-101","col5":"A-01-A","col6":"100","col7":"Completed"},
      {"col0":"06/22/2026","col1":"GRN-002","col2":"SKU-002","col3":"Item Beta Standard","col4":"PLT-102","col5":"C-04-B","col6":"50","col7":"Completed"}
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
