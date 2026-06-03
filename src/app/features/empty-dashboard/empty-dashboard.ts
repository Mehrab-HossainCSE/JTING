import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-empty-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './empty-dashboard.html',
  styleUrl: './empty-dashboard.scss',
})
export class EmptyDashboard {
  private router = inject(Router);

  goHome() {
    this.router.navigate(['/']);
  }
}
