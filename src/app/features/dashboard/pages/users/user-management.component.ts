import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container">
      <h2>User Management Page</h2>
    </div>
  `,
  styles: [`
    .page-container { padding: 2rem; }
    h2 { color: #333; font-weight: 600; }
  `]
})
export class UserManagementComponent {}
