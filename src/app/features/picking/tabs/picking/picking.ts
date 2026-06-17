import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-picking-tab',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './picking.html',
  styleUrl: './picking.scss'
})
export class Picking implements OnInit {
  // Filters
  selectedSku = signal('');
  pickerName = signal('ms');
  kuValue = signal('KU'); // Based on image dropdown KU
  qty = signal<number | null>(null);
  
  // Stats (Labels in image)
  pickingStock = signal(0);
  stock = signal(0);
  
  // State
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
