import { Component, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header-component.html',
  styleUrl: './header-component.scss'
})
export class HeaderComponent {
  private router = inject(Router);

  isProfileDropdownOpen = false;

  toggleProfileDropdown() {
    this.isProfileDropdownOpen = !this.isProfileDropdownOpen;
  }

  @HostListener('document:click', ['$event'])
  closeDropdown(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-profile-dropdown')) {
      this.isProfileDropdownOpen = false;
    }
  }

  logout() {
    // Implement logout logic here
    console.log('Logging out...');
    this.router.navigate(['/auth/login']);
  }

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
