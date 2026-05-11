import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './header-component.html',
  styleUrl: './header-component.scss'
})
export class HeaderComponent {
  private router = inject(Router);

  getPageTitle(): string {
    const url = this.router.url;
    if (url.includes('users')) return 'User Management';
    if (url.includes('master')) return 'Master Setup';
    if (url.includes('receive')) return 'Receive Module';
    if (url.includes('picking')) return 'Picking Module';
    if (url.includes('delivery')) return 'Delivery Module';
    if (url.includes('report')) return 'Report';
    if (url.includes('help')) return 'Help';
    return 'Dashboard';
  }
}
