import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-quarantine-report',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './quarantine-report.html',
  styleUrl: './quarantine-report.scss'
})
export class QuarantineReport implements OnInit {
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
      {"col0":"SKU-002","col1":"Item Beta Standard","col2":"B-2002","col3":"PLT-102","col4":"C-04-B","col5":"Quality Audit","col6":"06/22/2026","col7":"50"},
      {"col0":"SKU-003","col1":"Item Gamma Deluxe","col2":"B-3003","col3":"PLT-303","col4":"D-02-C","col5":"Damaged Box","col6":"06/21/2026","col7":"10"}
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
