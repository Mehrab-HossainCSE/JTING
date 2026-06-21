import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-start-picking',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './start-picking.html',
  styleUrl: './start-picking.scss'
})
export class StartPicking implements OnInit {
  selectedSku = signal('');
  pickerName = signal('ms');
  kuValue = signal('KU');
  qty = signal<number | null>(null);

  pickingStock = signal(0);
  stock = signal(0);

  isLoading = signal(false);
  results = signal<any[]>([]);

  ngOnInit(): void {
    this.results.set([]);
  }

  onAdd() {
    console.log('Add clicked');
  }

  onManualAdd() {
    console.log('Manual Add clicked');
  }

  onSave() {
    console.log('Save clicked');
  }
}
