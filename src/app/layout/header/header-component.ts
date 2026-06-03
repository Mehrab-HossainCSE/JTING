import { Component, inject, HostListener, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header-component.html',
  styleUrl: './header-component.scss'
})
export class HeaderComponent implements OnInit {
  private router = inject(Router);
  private authService = inject(AuthService);

  isProfileDropdownOpen = false;

  userName = signal('User');
  userEmail = signal('');
  userRole = signal('Role');
  userInitials = signal('U');

  ngOnInit() {
    debugger;
    const userInfo = this.authService.getUserInfo();
    console.log('HeaderComponent initialized. User info:', userInfo);
       
    if (userInfo) {
      const nameStr = userInfo.name || 'User';
      this.userName.set(nameStr);
      
      const nameParts = nameStr.trim().split(' ');
      let initials = nameParts[0].substring(0, 1);
      if (nameParts.length > 1) {
        initials += nameParts[nameParts.length - 1].substring(0, 1);
      } else if (nameStr.length > 1) {
        initials += nameStr.substring(1, 2);
      }
      this.userInitials.set(initials.toUpperCase());

      // Decode token to extract email and role claims
      if (userInfo.token) {
        const decoded = this.decodeJwt(userInfo.token);
        if (decoded) {
          this.userEmail.set(decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || '');
          this.userRole.set(decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || '');
        }
      }
    }
  }

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
    this.authService.logout();
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

  // Helper method to parse the JWT
  private decodeJwt(token: string) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        window.atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error('Failed to decode JWT', e);
      return null;
    }
  }
}
