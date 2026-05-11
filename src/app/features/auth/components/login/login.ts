import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private auth = inject(AuthService);
  private router = inject(Router);

  terminal = signal('T-001');
  userName = signal('foysal');
  password = signal('123');
  error = signal('');
  loading = signal(false);
  showPassword = signal(false);

  login() {
    console.log('Login button clicked!');
    this.loading.set(true);
    
    // Set a dummy token so the auth guard lets us in for static UI/UX testing
    localStorage.setItem('token', 'dummy-token-for-ui-testing');
    localStorage.setItem('userName', 'James Admin');

    setTimeout(() => {
        console.log('Navigating to dashboard...');
        this.router.navigate(['/dashboard']).then(success => {
            if (success) {
                console.log('Navigation successful!');
            } else {
                console.error('Navigation failed!');
                // Fallback
                window.location.href = '/dashboard';
            }
            this.loading.set(false);
        });
    }, 500);
  }
}